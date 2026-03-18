import { readFile } from 'node:fs/promises';
import path from 'node:path';

const EPSILON = 0.5;
const BOX_INTERIOR_THRESHOLD = 8;
const BOX_BORDER_OVERLAP_THRESHOLD = 10;
const MAX_OBSTACLE_AREA = 100_000;
const MAX_OBSTACLE_WIDTH = 420;
const MAX_OBSTACLE_HEIGHT = 240;
const TEXT_OVERFLOW_TOLERANCE = 4;
const DEFAULT_TEXT_PADDING = 4;
const MIN_TERMINAL_SEGMENT_LENGTH = 20;
const TERMINAL_SEGMENT_NOISE_TOLERANCE = 1;
const LABEL_INTERIOR_THRESHOLD = 1;
const LABEL_BOX_PADDING = 2;
const LABEL_RECT_OVERLAP_AREA_THRESHOLD = 24;
const MIN_TEXT_CONTRAST_RATIO = 4.5;
const LARGE_TEXT_CONTRAST_RATIO = 3;
const EMPHASIS_DARK_CARD_MAX_WIDTH = 320;
const EMPHASIS_DARK_CARD_MAX_HEIGHT = 120;
const EMPHASIS_DARK_CARD_MIN_LINES = 3;
const EMPHASIS_DARK_CARD_MAX_FONT_SIZE = 15;
const EMPHASIS_DARK_CARD_WIDTH_RATIO_THRESHOLD = 0.6;
const FRAME_CELL_ID_PATTERN = /(?:^|[-_])frame(?:[-_]|$)/i;
const SUPPORTED_NON_RECT_BORDER_SHAPES = new Set(['document', 'hexagon', 'parallelogram', 'trapezoid']);

function parseAttributes(source) {
  const attributes = {};

  for (const match of source.matchAll(/([:\w-]+)="([^"]*)"/g)) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

function parseStyle(styleText = '') {
  const style = {};

  for (const declaration of styleText.split(';')) {
    const trimmed = declaration.trim();
    if (!trimmed) {
      continue;
    }

    const separatorIndex = (() => {
      const equalsIndex = trimmed.indexOf('=');
      const colonIndex = trimmed.indexOf(':');

      if (equalsIndex === -1) {
        return colonIndex;
      }

      if (colonIndex === -1) {
        return equalsIndex;
      }

      return Math.min(equalsIndex, colonIndex);
    })();

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key) {
      style[key] = value;
    }
  }

  return style;
}

function getPaint(attributes, name) {
  if (attributes[name]) {
    return attributes[name];
  }

  const style = parseStyle(attributes.style);
  return style[name];
}

function getPresentationValue(attributes, name) {
  if (attributes[name] !== undefined) {
    return attributes[name];
  }

  const style = parseStyle(attributes.style);
  return style[name];
}

function isNone(value) {
  return value === undefined || value === null || value === '' || value === 'none';
}

function normalizePaint(value) {
  return String(value ?? '').trim().toLowerCase();
}

function parseHexColor(value) {
  const normalized = normalizePaint(value);

  if (!normalized.startsWith('#')) {
    return null;
  }

  if (normalized.length === 4) {
    return {
      r: Number.parseInt(normalized.slice(1, 2).repeat(2), 16),
      g: Number.parseInt(normalized.slice(2, 3).repeat(2), 16),
      b: Number.parseInt(normalized.slice(3, 4).repeat(2), 16),
    };
  }

  if (normalized.length === 7) {
    return {
      r: Number.parseInt(normalized.slice(1, 3), 16),
      g: Number.parseInt(normalized.slice(3, 5), 16),
      b: Number.parseInt(normalized.slice(5, 7), 16),
    };
  }

  return null;
}

function relativeLuminance(value) {
  const color = parseHexColor(value);

  if (!color) {
    return null;
  }

  const toLinear = (channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return (
    (0.2126 * toLinear(color.r))
    + (0.7152 * toLinear(color.g))
    + (0.0722 * toLinear(color.b))
  );
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);

  if (foregroundLuminance === null || backgroundLuminance === null) {
    return null;
  }

  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function isDarkPaint(value) {
  const luminance = relativeLuminance(value);

  if (luminance === null) {
    return false;
  }

  return luminance <= 0.2;
}

function parseTranslate(transformText = '') {
  const match = transformText.match(/translate\(\s*([-\d.]+)(?:[\s,]+([-\d.]+))?\s*\)/i);

  if (!match) {
    return { x: 0, y: 0 };
  }

  return {
    x: Number(match[1]),
    y: Number(match[2] ?? 0),
  };
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function decodeXmlEntities(text = '') {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&amp;/g, '&');
}

function parsePathData(d, offset) {
  const tokens = d.match(/[MLZmlz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  const segments = [];

  let index = 0;
  let command = null;
  let current = null;
  let start = null;

  function readPoint(relative) {
    const x = Number(tokens[index++]);
    const y = Number(tokens[index++]);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return null;
    }

    if (!current) {
      return {
        x: x + offset.x,
        y: y + offset.y,
      };
    }

    if (!relative) {
      return {
        x: x + offset.x,
        y: y + offset.y,
      };
    }

    return {
      x: current.x + x,
      y: current.y + y,
    };
  }

  while (index < tokens.length) {
    const token = tokens[index];

    if (/^[MLZmlz]$/.test(token)) {
      command = token;
      index += 1;
    }

    if (!command) {
      throw new Error(`Unsupported or malformed path: ${d}`);
    }

    if (command === 'M' || command === 'm') {
      const firstPoint = readPoint(command === 'm');

      if (!firstPoint) {
        break;
      }

      current = firstPoint;
      start = firstPoint;

      while (index < tokens.length && !/^[MLZmlz]$/.test(tokens[index])) {
        const point = readPoint(command === 'm');

        if (!point) {
          break;
        }

        segments.push({ start: current, end: point });
        current = point;
      }

      command = command === 'm' ? 'l' : 'L';
      continue;
    }

    if (command === 'L' || command === 'l') {
      while (index < tokens.length && !/^[MLZmlz]$/.test(tokens[index])) {
        const point = readPoint(command === 'l');

        if (!point) {
          break;
        }

        segments.push({ start: current, end: point });
        current = point;
      }

      continue;
    }

    if (command === 'Z' || command === 'z') {
      if (current && start) {
        segments.push({ start: current, end: start });
        current = start;
      }

      command = null;
    }
  }

  return segments;
}

function approximatelyEqual(a, b, epsilon = EPSILON) {
  return Math.abs(a - b) <= epsilon;
}

function samePoint(a, b, epsilon = EPSILON) {
  return approximatelyEqual(a.x, b.x, epsilon) && approximatelyEqual(a.y, b.y, epsilon);
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function cross(a, b) {
  return (a.x * b.y) - (a.y * b.x);
}

function dot(a, b) {
  return (a.x * b.x) + (a.y * b.y);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function segmentLength(segment) {
  return distance(segment.start, segment.end);
}

function segmentBounds(segment) {
  return {
    minX: Math.min(segment.start.x, segment.end.x),
    maxX: Math.max(segment.start.x, segment.end.x),
    minY: Math.min(segment.start.y, segment.end.y),
    maxY: Math.max(segment.start.y, segment.end.y),
  };
}

function boundsOverlap(a, b, epsilon = EPSILON) {
  return !(
    a.maxX < (b.minX - epsilon)
    || a.minX > (b.maxX + epsilon)
    || a.maxY < (b.minY - epsilon)
    || a.minY > (b.maxY + epsilon)
  );
}

function rectBounds(rect) {
  return {
    minX: rect.x,
    maxX: rect.x + rect.width,
    minY: rect.y,
    maxY: rect.y + rect.height,
  };
}

function intersectionRect(a, b) {
  const minX = Math.max(a.x, b.x);
  const minY = Math.max(a.y, b.y);
  const maxX = Math.min(a.x + a.width, b.x + b.width);
  const maxY = Math.min(a.y + a.height, b.y + b.height);

  if (maxX <= minX || maxY <= minY) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function rectContainsRect(outer, inner, epsilon = EPSILON) {
  return (
    inner.x >= outer.x - epsilon
    && inner.y >= outer.y - epsilon
    && (inner.x + inner.width) <= (outer.x + outer.width + epsilon)
    && (inner.y + inner.height) <= (outer.y + outer.height + epsilon)
  );
}

function isOwnedTextRectPair(labelCellId, rectCellId) {
  const normalizedLabelId = String(labelCellId).replace(/(?:-text|_text)$/i, '');
  return normalizedLabelId === rectCellId;
}

function expandBounds(bounds, padding) {
  return {
    minX: bounds.minX - padding,
    maxX: bounds.maxX + padding,
    minY: bounds.minY - padding,
    maxY: bounds.maxY + padding,
  };
}

function rangeOverlapLength(firstStart, firstEnd, secondStart, secondEnd) {
  const overlapStart = Math.max(Math.min(firstStart, firstEnd), Math.min(secondStart, secondEnd));
  const overlapEnd = Math.min(Math.max(firstStart, firstEnd), Math.max(secondStart, secondEnd));
  return Math.max(0, overlapEnd - overlapStart);
}

function classifySegmentIntersection(first, second) {
  const firstVector = subtract(first.end, first.start);
  const secondVector = subtract(second.end, second.start);
  const delta = subtract(second.start, first.start);
  const denominator = cross(firstVector, secondVector);
  const deltaFirst = cross(delta, firstVector);
  const deltaSecond = cross(delta, secondVector);

  if (Math.abs(denominator) <= EPSILON) {
    if (Math.abs(deltaFirst) > EPSILON) {
      return null;
    }

    const useX = Math.abs(firstVector.x) >= Math.abs(firstVector.y);
    const axis = useX ? 'x' : 'y';
    const firstMin = Math.min(first.start[axis], first.end[axis]);
    const firstMax = Math.max(first.start[axis], first.end[axis]);
    const secondMin = Math.min(second.start[axis], second.end[axis]);
    const secondMax = Math.max(second.start[axis], second.end[axis]);
    const overlapStart = Math.max(firstMin, secondMin);
    const overlapEnd = Math.min(firstMax, secondMax);

    if ((overlapEnd - overlapStart) <= EPSILON) {
      return null;
    }

    return {
      type: 'overlap',
      length: overlapEnd - overlapStart,
      detail: `collinear overlap (${(overlapEnd - overlapStart).toFixed(1)}px)`,
    };
  }

  const t = cross(delta, secondVector) / denominator;
  const u = deltaSecond / denominator;

  if (
    t < -EPSILON
    || t > 1 + EPSILON
    || u < -EPSILON
    || u > 1 + EPSILON
  ) {
    return null;
  }

  const point = {
    x: first.start.x + (t * firstVector.x),
    y: first.start.y + (t * firstVector.y),
  };

  const atEndpointOfFirst = samePoint(point, first.start) || samePoint(point, first.end);
  const atEndpointOfSecond = samePoint(point, second.start) || samePoint(point, second.end);

  if (atEndpointOfFirst && atEndpointOfSecond) {
    return null;
  }

  return {
    type: 'crossing',
    point,
    detail: `crossing near (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`,
  };
}

function interiorLengthInsideRect(segment, rect) {
  const dx = segment.end.x - segment.start.x;
  const dy = segment.end.y - segment.start.y;
  let t0 = 0;
  let t1 = 1;

  const checks = [
    [-dx, segment.start.x - rect.x],
    [dx, (rect.x + rect.width) - segment.start.x],
    [-dy, segment.start.y - rect.y],
    [dy, (rect.y + rect.height) - segment.start.y],
  ];

  for (const [p, q] of checks) {
    if (Math.abs(p) <= EPSILON) {
      if (q < 0) {
        return 0;
      }
      continue;
    }

    const ratio = q / p;

    if (p < 0) {
      t0 = Math.max(t0, ratio);
    } else {
      t1 = Math.min(t1, ratio);
    }

    if (t0 > t1) {
      return 0;
    }
  }

  return Math.max(0, t1 - t0) * distance(segment.start, segment.end);
}

function borderContactTolerance(edge, rect) {
  const edgeStroke = Math.max(1, edge.strokeWidth ?? 1);
  const rectStroke = Math.max(1, rect.strokeWidth ?? 1);
  return ((edgeStroke + rectStroke) / 2) + EPSILON;
}

function insetRect(rect, inset) {
  const width = rect.width - (inset * 2);
  const height = rect.height - (inset * 2);

  if (width <= 0 || height <= 0) {
    return null;
  }

  return {
    x: rect.x + inset,
    y: rect.y + inset,
    width,
    height,
  };
}

function findSegmentRectBorderContacts(segment, edge, rect) {
  if (isNone(rect.stroke)) {
    return [];
  }

  const tolerance = borderContactTolerance(edge, rect);
  const contacts = [];
  const horizontal = approximatelyEqual(segment.start.y, segment.end.y, tolerance);
  const vertical = approximatelyEqual(segment.start.x, segment.end.x, tolerance);
  const rectRight = rect.x + rect.width;
  const rectBottom = rect.y + rect.height;

  if (horizontal) {
    const y = (segment.start.y + segment.end.y) / 2;
    const overlapLength = rangeOverlapLength(segment.start.x, segment.end.x, rect.x, rectRight);

    if (overlapLength > BOX_BORDER_OVERLAP_THRESHOLD) {
      const topDistance = Math.abs(y - rect.y);
      if (topDistance <= tolerance) {
        contacts.push({
          side: 'top',
          length: overlapLength,
          offset: topDistance,
        });
      }

      const bottomDistance = Math.abs(y - rectBottom);
      if (bottomDistance <= tolerance) {
        contacts.push({
          side: 'bottom',
          length: overlapLength,
          offset: bottomDistance,
        });
      }
    }
  }

  if (vertical) {
    const x = (segment.start.x + segment.end.x) / 2;
    const overlapLength = rangeOverlapLength(segment.start.y, segment.end.y, rect.y, rectBottom);

    if (overlapLength > BOX_BORDER_OVERLAP_THRESHOLD) {
      const leftDistance = Math.abs(x - rect.x);
      if (leftDistance <= tolerance) {
        contacts.push({
          side: 'left',
          length: overlapLength,
          offset: leftDistance,
        });
      }

      const rightDistance = Math.abs(x - rectRight);
      if (rightDistance <= tolerance) {
        contacts.push({
          side: 'right',
          length: overlapLength,
          offset: rightDistance,
        });
      }
    }
  }

  return contacts;
}

function isBackgroundRect(rect) {
  const lowerId = rect.cellId.toLowerCase();
  const area = rect.width * rect.height;

  if (
    lowerId.startsWith('label-')
    || lowerId.includes('-label')
    || lowerId.endsWith('-chip')
    || lowerId.includes('-chip-')
    || lowerId.endsWith('_chip')
    || lowerId.includes('badge')
    || lowerId === 'title'
    || lowerId === 'title-bg'
    || lowerId.endsWith('-bg')
    || lowerId.endsWith('_bg')
    || lowerId.includes('background')
    || lowerId.includes('layer-bg')
  ) {
    return true;
  }

  if (area > MAX_OBSTACLE_AREA) {
    return true;
  }

  return rect.width > MAX_OBSTACLE_WIDTH || rect.height > MAX_OBSTACLE_HEIGHT;
}

function classifyRectLintRole(rect) {
  if (FRAME_CELL_ID_PATTERN.test(rect.cellId)) {
    return 'border-only';
  }

  if (isBackgroundRect(rect)) {
    return 'ignore';
  }

  return 'obstacle';
}

function parseStyleNumber(style, key, fallback = null) {
  const rawValue = style[key];

  if (rawValue === undefined) {
    return fallback;
  }

  const match = String(rawValue).match(/-?\d*\.?\d+/);
  if (!match) {
    return fallback;
  }

  return Number(match[0]);
}

function estimateTextWidth(text, fontSize) {
  let width = 0;

  for (const char of text) {
    if (/\s/.test(char)) {
      width += fontSize * 0.35;
      continue;
    }

    if (/[\u3000-\u30FF\u3400-\u9FFF\uF900-\uFAFF]/u.test(char)) {
      width += fontSize * 0.92;
      continue;
    }

    if (/[A-Z0-9]/.test(char)) {
      width += fontSize * 0.62;
      continue;
    }

    width += fontSize * 0.56;
  }

  return width;
}

function extractLineMetrics(value, defaultFontSize) {
  const decoded = decodeXmlEntities(value);
  const tokenRegex = /<br\s*\/?>|<font\b([^>]*)>|<\/font>|([^<]+)/gi;
  const fontStack = [defaultFontSize];
  const lines = [];
  let currentLine = { width: 0, fontSize: defaultFontSize, text: '' };

  function pushLine() {
    lines.push(currentLine);
    currentLine = { width: 0, fontSize: defaultFontSize, text: '' };
  }

  for (const match of decoded.matchAll(tokenRegex)) {
    const [token, fontAttributes = '', textChunk = ''] = match;

    if (/^<br/i.test(token)) {
      pushLine();
      continue;
    }

    if (/^<font/i.test(token)) {
      const attributes = parseAttributes(fontAttributes);
      const inlineStyle = parseStyle(attributes.style ?? '');
      const fontSize = parseStyleNumber(inlineStyle, 'font-size', fontStack[fontStack.length - 1]);
      fontStack.push(fontSize);
      continue;
    }

    if (/^<\/font/i.test(token)) {
      if (fontStack.length > 1) {
        fontStack.pop();
      }
      continue;
    }

    if (!textChunk) {
      continue;
    }

    const normalizedText = textChunk.replace(/\s+/g, ' ');
    const fontSize = fontStack[fontStack.length - 1];
    currentLine.width += estimateTextWidth(normalizedText, fontSize);
    currentLine.fontSize = Math.max(currentLine.fontSize, fontSize);
    currentLine.text += normalizedText;
  }

  if (currentLine.text || lines.length === 0) {
    lines.push(currentLine);
  }

  return lines.filter((line) => line.text.trim().length > 0);
}

function estimateWrappedMetrics(lines, availableWidth) {
  if (availableWidth <= 0) {
    return {
      estimatedWidth: lines.reduce((maxWidth, line) => Math.max(maxWidth, line.width), 0),
      estimatedHeight: lines.reduce((total, line) => total + (line.fontSize * 1.25), 0),
    };
  }

  let estimatedWidth = 0;
  let estimatedHeight = 0;

  for (const line of lines) {
    const wrappedLineCount = Math.max(1, Math.ceil(line.width / availableWidth));
    estimatedWidth = Math.max(estimatedWidth, Math.min(line.width, availableWidth));
    estimatedHeight += wrappedLineCount * line.fontSize * 1.25;
  }

  return { estimatedWidth, estimatedHeight };
}

function getShapeTextInsets(style, width, height, fontSize) {
  const shape = String(style.shape ?? '').toLowerCase();
  const insets = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  if (shape === 'document') {
    const sideInset = Math.max(8, width * 0.035);
    return {
      left: sideInset,
      right: sideInset,
      top: Math.max(6, fontSize * 0.25),
      bottom: Math.max(fontSize * 2.2, height * 0.4),
    };
  }

  if (shape === 'folder') {
    return {
      ...insets,
      top: Math.max(10, height * 0.12),
    };
  }

  return insets;
}

function getShapeLineWidthBudget({ shape, width, height, lineCenterY, spacingLeft, spacingRight, fontSize }) {
  const innerWidth = Math.max(0, width - spacingLeft - spacingRight);

  if (shape === 'hexagon') {
    const baseInset = Math.max(fontSize * 0.35, width * 0.04);
    const taperInset = Math.max(width * 0.25, fontSize * 2)
      * Math.abs(((lineCenterY / height) * 2) - 1);

    return Math.max(0, innerWidth - (2 * (baseInset + taperInset)));
  }

  if (shape === 'trapezoid') {
    const baseInset = Math.max(fontSize * 0.35, width * 0.035);
    const taperInset = Math.max(width * 0.18, fontSize * 1.4)
      * Math.max(0, 1 - (lineCenterY / height));

    return Math.max(0, innerWidth - (2 * (baseInset + taperInset)));
  }

  return null;
}

function findShapeAwareWidthProfile({
  availableHeight,
  fontSize,
  height,
  lines,
  shape,
  shapeInsets,
  spacingLeft,
  spacingRight,
  spacingTop,
  width,
}) {
  if (!['hexagon', 'trapezoid'].includes(shape) || lines.length === 0) {
    return null;
  }

  const totalLineHeight = lines.reduce((total, line) => total + (line.fontSize * 1.25), 0);
  const verticalOffset = Math.max(0, (availableHeight - totalLineHeight) / 2);
  let cursorY = spacingTop + shapeInsets.top + verticalOffset;
  let worstFit = null;

  for (const line of lines) {
    const lineHeight = line.fontSize * 1.25;
    const lineCenterY = cursorY + (lineHeight / 2);
    const lineAvailableWidth = getShapeLineWidthBudget({
      shape,
      width,
      height,
      lineCenterY,
      spacingLeft,
      spacingRight,
      fontSize: line.fontSize || fontSize,
    });

    if (lineAvailableWidth !== null && line.width > lineAvailableWidth + TEXT_OVERFLOW_TOLERANCE) {
      const overflowAmount = line.width - lineAvailableWidth;

      if (!worstFit || overflowAmount > worstFit.overflowAmount) {
        worstFit = {
          availableWidth: lineAvailableWidth,
          estimatedWidth: line.width,
          overflowAmount,
        };
      }
    }

    cursorY += lineHeight;
  }

  return worstFit;
}

function parseDrawioTextLayouts(drawioText) {
  const layouts = [];
  const cellRegex = /<mxCell\b([^>]*?)(?:\/>|>([\s\S]*?)<\/mxCell>)/g;

  for (const match of drawioText.matchAll(cellRegex)) {
    const [, rawAttributes = '', body = ''] = match;
    const attributes = parseAttributes(rawAttributes);
    const rawStyle = attributes.style ?? '';
    const isTextCell = /(^|;)text(;|$)/i.test(rawStyle);

    if (attributes.vertex !== '1') {
      continue;
    }

    if (!attributes.value) {
      continue;
    }

    const geometryMatch = body.match(/<mxGeometry\b([^>]*?)\/>/);
    if (!geometryMatch) {
      continue;
    }

    const geometryAttributes = parseAttributes(geometryMatch[1]);
    const x = toNumber(geometryAttributes.x);
    const y = toNumber(geometryAttributes.y);
    const width = toNumber(geometryAttributes.width);
    const height = toNumber(geometryAttributes.height);

    if (width <= 0 || height <= 0) {
      continue;
    }

    const style = parseStyle(rawStyle);
    const shape = String(style.shape ?? '').toLowerCase();
    const decodedValue = decodeXmlEntities(attributes.value);
    const fontSize = parseStyleNumber(style, 'fontSize', 17);
    const spacingDefault = isTextCell ? 0 : DEFAULT_TEXT_PADDING;
    const spacing = parseStyleNumber(style, 'spacing', spacingDefault);
    const spacingLeft = parseStyleNumber(style, 'spacingLeft', spacing);
    const spacingRight = parseStyleNumber(style, 'spacingRight', spacing);
    const spacingTop = parseStyleNumber(style, 'spacingTop', spacing);
    const spacingBottom = parseStyleNumber(style, 'spacingBottom', spacing);
    const align = style.align ?? 'left';
    const verticalAlign = style.verticalAlign ?? 'middle';
    const shapeInsets = isTextCell
      ? { left: 0, right: 0, top: 0, bottom: 0 }
      : getShapeTextInsets(style, width, height, fontSize);
    const lines = extractLineMetrics(attributes.value, fontSize);
    const availableWidth = Math.max(0, width - spacingLeft - spacingRight - shapeInsets.left - shapeInsets.right);
    const availableHeight = Math.max(0, height - spacingTop - spacingBottom - shapeInsets.top - shapeInsets.bottom);
    const wrappedMetrics = estimateWrappedMetrics(lines, availableWidth);
    const shapeAwareWidthProfile = isTextCell
      ? null
      : findShapeAwareWidthProfile({
        availableHeight,
        fontSize,
        height,
        lines,
        shape,
        shapeInsets,
        spacingLeft,
        spacingRight,
        spacingTop,
        width,
      });
    const normalizedValue = decodedValue.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const textCellMetrics = {
      estimatedWidth: lines.reduce((maxWidth, line) => Math.max(maxWidth, line.width), 0),
      estimatedHeight: lines.reduce((total, line) => total + (line.fontSize * 1.25), 0),
    };
    const estimatedWidth = isTextCell
      ? textCellMetrics.estimatedWidth
      : (shapeAwareWidthProfile?.estimatedWidth ?? wrappedMetrics.estimatedWidth);
    const estimatedHeight = isTextCell
      ? textCellMetrics.estimatedHeight
      : wrappedMetrics.estimatedHeight;
    const measuredAvailableWidth = shapeAwareWidthProfile?.availableWidth ?? availableWidth;
    const contentWidth = Math.min(estimatedWidth, availableWidth);
    const contentHeight = Math.min(estimatedHeight, availableHeight);

    let contentX = x + spacingLeft + shapeInsets.left;
    if (align === 'center') {
      contentX = x + spacingLeft + shapeInsets.left + ((availableWidth - contentWidth) / 2);
    } else if (align === 'right') {
      contentX = x + width - spacingRight - shapeInsets.right - contentWidth;
    }

    let contentY = y + spacingTop + shapeInsets.top;
    if (verticalAlign === 'middle') {
      contentY = y + spacingTop + shapeInsets.top + ((availableHeight - contentHeight) / 2);
    } else if (verticalAlign === 'bottom') {
      contentY = y + height - spacingBottom - shapeInsets.bottom - contentHeight;
    }

    const paddedWidth = clamp(contentWidth + (LABEL_BOX_PADDING * 2), 0, width);
    const paddedHeight = clamp(contentHeight + (LABEL_BOX_PADDING * 2), 0, height);
    const labelBoxX = clamp(contentX - LABEL_BOX_PADDING, x, x + width - paddedWidth);
    const labelBoxY = clamp(contentY - LABEL_BOX_PADDING, y, y + height - paddedHeight);
    const topInset = Math.max(0, contentY - y);
    const leftInset = Math.max(0, contentX - x);
    const rightInset = Math.max(0, (x + width) - (contentX + contentWidth));
    const bottomInset = Math.max(0, (y + height) - (contentY + contentHeight));

    layouts.push({
      cellId: attributes.id ?? 'unknown-cell',
      rawValue: decodedValue,
      value: normalizedValue,
      isTextCell,
      fillColor: style.fillColor,
      fontColor: style.fontColor,
      fontSize,
      lineCount: lines.length,
      width,
      height,
      startsWithBoldLine: /^\s*<b\b/i.test(decodedValue),
      hasInlineFontMarkup: /<font\b/i.test(decodedValue),
      hasInlineColorMarkup: /<font\b[^>]*(?:color=|style=\"[^\"]*color\s*:)/i.test(decodedValue),
      availableWidth: measuredAvailableWidth,
      availableHeight,
      estimatedWidth,
      estimatedHeight,
      overflowTolerance: shape === 'document' ? 1 : TEXT_OVERFLOW_TOLERANCE,
      contentX,
      contentY,
      contentWidth,
      contentHeight,
      topInset,
      leftInset,
      rightInset,
      bottomInset,
      labelBox: {
        cellId: attributes.id ?? 'unknown-cell',
        x: labelBoxX,
        y: labelBoxY,
        width: paddedWidth,
        height: paddedHeight,
        label: normalizedValue,
      },
    });
  }

  return layouts;
}

function parseDrawioRectLayouts(drawioText) {
  const rects = [];
  const cellRegex = /<mxCell\b([^>]*?)(?:\/>|>([\s\S]*?)<\/mxCell>)/g;

  for (const match of drawioText.matchAll(cellRegex)) {
    const [, rawAttributes = '', body = ''] = match;
    const attributes = parseAttributes(rawAttributes);
    const rawStyle = attributes.style ?? '';

    if (attributes.vertex !== '1') {
      continue;
    }

    if (/(^|;)text(;|$)/i.test(rawStyle)) {
      continue;
    }

    const style = parseStyle(rawStyle);
    const shape = String(style.shape ?? '').toLowerCase();

    if (shape && !['rect', 'rectangle'].includes(shape)) {
      continue;
    }

    const geometryMatch = body.match(/<mxGeometry\b([^>]*?)\/>/);
    if (!geometryMatch) {
      continue;
    }

    const geometryAttributes = parseAttributes(geometryMatch[1]);
    const width = toNumber(geometryAttributes.width);
    const height = toNumber(geometryAttributes.height);

    if (width <= 0 || height <= 0) {
      continue;
    }

    const rect = {
      cellId: attributes.id ?? 'unknown-cell',
      x: toNumber(geometryAttributes.x),
      y: toNumber(geometryAttributes.y),
      width,
      height,
      stroke: style.strokeColor,
    };
    const lintRole = classifyRectLintRole(rect);

    if (lintRole === 'ignore') {
      continue;
    }

    rects.push({
      ...rect,
      lintRole,
    });
  }

  return rects;
}

function findTextOverflowIssues(textBlocks) {
  const issues = [];

  for (const block of textBlocks) {
    const overflowTolerance = block.overflowTolerance ?? TEXT_OVERFLOW_TOLERANCE;

    if (block.estimatedWidth > block.availableWidth + overflowTolerance) {
      issues.push({
        type: 'text-overflow',
        axis: 'width',
        cellId: block.cellId,
        available: block.availableWidth,
        estimated: block.estimatedWidth,
        label: block.value,
      });
    }

    if (block.estimatedHeight > block.availableHeight + overflowTolerance) {
      issues.push({
        type: 'text-overflow',
        axis: 'height',
        cellId: block.cellId,
        available: block.availableHeight,
        estimated: block.estimatedHeight,
        label: block.value,
      });
    }
  }

  return issues;
}

function findTextContrastIssues(textBlocks) {
  const issues = [];

  for (const block of textBlocks) {
    const ratio = contrastRatio(block.fontColor, block.fillColor);

    if (ratio === null) {
      continue;
    }

    const threshold = block.fontSize >= 18 ? LARGE_TEXT_CONTRAST_RATIO : MIN_TEXT_CONTRAST_RATIO;
    if (ratio + EPSILON >= threshold) {
      continue;
    }

    issues.push({
      type: 'text-contrast',
      cellId: block.cellId,
      label: block.value,
      contrastRatio: ratio,
      threshold,
      fontColor: block.fontColor,
      fillColor: block.fillColor,
    });
  }

  return issues;
}

function findTextEmphasisIssues(textBlocks) {
  const issues = [];

  for (const block of textBlocks) {
    if (
      block.isTextCell
      || !isDarkPaint(block.fillColor)
      || block.lineCount < EMPHASIS_DARK_CARD_MIN_LINES
      || block.fontSize > EMPHASIS_DARK_CARD_MAX_FONT_SIZE
      || block.width > EMPHASIS_DARK_CARD_MAX_WIDTH
      || block.height > EMPHASIS_DARK_CARD_MAX_HEIGHT
      || !block.startsWithBoldLine
      || block.hasInlineFontMarkup
      || block.hasInlineColorMarkup
    ) {
      continue;
    }

    const widthRatio = block.availableWidth > 0 ? block.estimatedWidth / block.availableWidth : Infinity;
    if (widthRatio + EPSILON < EMPHASIS_DARK_CARD_WIDTH_RATIO_THRESHOLD) {
      continue;
    }

    issues.push({
      type: 'text-emphasis',
      cellId: block.cellId,
      label: block.value,
      lineCount: block.lineCount,
      fontSize: block.fontSize,
      widthRatio,
      topInset: block.topInset,
      fillColor: block.fillColor,
      fontColor: block.fontColor,
    });
  }

  return issues;
}

function findEdgeLabelCollisions(edges, labelBoxes) {
  const issues = [];

  for (const edge of edges) {
    for (const label of labelBoxes) {
      if (edge.cellId === label.cellId) {
        continue;
      }

      const bounds = rectBounds(label);

      for (const segment of edge.segments) {
        if (!boundsOverlap(segmentBounds(segment), bounds)) {
          continue;
        }

        const interiorLength = interiorLengthInsideRect(segment, label);

        if (interiorLength > LABEL_INTERIOR_THRESHOLD) {
          issues.push({
            type: 'edge-label',
            edgeCellId: edge.cellId,
            labelCellId: label.cellId,
            label: label.label,
            length: interiorLength,
          });
        }
      }
    }
  }

  return issues;
}

function findLabelRectOverlaps(labelBoxes, rects) {
  const issues = [];

  for (const label of labelBoxes) {
    for (const rect of rects) {
      if (label.cellId === rect.cellId) {
        continue;
      }

      if (rect.lintRole !== 'obstacle') {
        continue;
      }

      if (isOwnedTextRectPair(label.cellId, rect.cellId)) {
        continue;
      }

      const overlap = intersectionRect(label, rect);

      if (!overlap) {
        continue;
      }

      if (rectContainsRect(rect, label)) {
        continue;
      }

      const area = overlap.width * overlap.height;

      if (area <= LABEL_RECT_OVERLAP_AREA_THRESHOLD) {
        continue;
      }

      issues.push({
        type: 'label-rect',
        labelCellId: label.cellId,
        rectCellId: rect.cellId,
        label: label.label,
        area,
        width: overlap.width,
        height: overlap.height,
      });
    }
  }

  return issues;
}

function findShortTerminalSegments(edges) {
  const issues = [];

  for (const edge of edges) {
    if (edge.segments.length === 0) {
      continue;
    }

    const terminal = {
      position: 'end',
      segment: edge.segments[edge.segments.length - 1],
    };
    const length = segmentLength(terminal.segment);

    if (length <= TERMINAL_SEGMENT_NOISE_TOLERANCE) {
      continue;
    }

    if (length + EPSILON >= MIN_TERMINAL_SEGMENT_LENGTH) {
      continue;
    }

    issues.push({
      type: 'edge-terminal',
      edgeCellId: edge.cellId,
      position: terminal.position,
      length,
    });
  }

  return issues;
}

function resolveTargetPath(input) {
  const resolved = path.resolve(process.cwd(), input);

  if (resolved.toLowerCase().endsWith('.drawio')) {
    return `${resolved}.svg`;
  }

  return resolved;
}

async function readCompanionDrawio(targetPath, originalInput) {
  const candidates = [];

  if (originalInput && originalInput.toLowerCase().endsWith('.drawio')) {
    candidates.push(path.resolve(process.cwd(), originalInput));
  }

  candidates.push(
    targetPath.replace(/\.svg$/i, ''),
    targetPath.replace(/\.drawio\.svg$/i, '.drawio'),
  );

  for (const candidate of candidates) {
    if (!candidate || candidate === targetPath) {
      continue;
    }

    try {
      return {
        path: candidate,
        text: await readFile(candidate, 'utf8'),
      };
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  return null;
}

function parseDrawioCellMetadata(drawioText) {
  const cells = new Map();
  const cellRegex = /<mxCell\b([^>]*?)(?:\/>|>([\s\S]*?)<\/mxCell>)/g;

  for (const match of drawioText.matchAll(cellRegex)) {
    const [, rawAttributes = '', body = ''] = match;
    const attributes = parseAttributes(rawAttributes);
    const cellId = attributes.id;

    if (!cellId) {
      continue;
    }

    const geometryMatch = body.match(/<mxGeometry\b([^>]*?)\/>/);

    cells.set(cellId, {
      cellId,
      edge: attributes.edge === '1',
      style: parseStyle(attributes.style ?? ''),
      vertex: attributes.vertex === '1',
      geometry: geometryMatch ? parseAttributes(geometryMatch[1]) : {},
    });
  }

  return cells;
}

function parseSvg(svgText, drawioCells = new Map()) {
  const cells = new Map();
  const tagRegex = /<\/?([A-Za-z][\w:-]*)([^<>]*?)\/?>/g;
  const stack = [{
    cellId: null,
    tx: 0,
    ty: 0,
  }];

  function getCurrentCellId() {
    for (let index = stack.length - 1; index >= 0; index -= 1) {
      if (stack[index].cellId) {
        return stack[index].cellId;
      }
    }
    return null;
  }

  function getCurrentOffset() {
    const top = stack[stack.length - 1];
    return { x: top.tx, y: top.ty };
  }

  function ensureCell(cellId) {
    if (!cells.has(cellId)) {
      cells.set(cellId, {
        cellId,
        rects: [],
        linePaths: [],
        shapeBorders: [],
      });
    }

    return cells.get(cellId);
  }

  for (const match of svgText.matchAll(tagRegex)) {
    const [rawTag, rawName, rawAttributes = ''] = match;
    const tagName = rawName.toLowerCase();
    const closing = rawTag.startsWith('</');
    const selfClosing = rawTag.endsWith('/>');

    if (closing) {
      if (stack.length > 1) {
        stack.pop();
      }
      continue;
    }

    const attributes = parseAttributes(rawAttributes);
    const currentCellId = attributes['data-cell-id'] ?? getCurrentCellId();
    const inheritedOffset = getCurrentOffset();
    const translate = parseTranslate(attributes.transform);
    const nextContext = {
      cellId: currentCellId,
      tx: inheritedOffset.x + translate.x,
      ty: inheritedOffset.y + translate.y,
    };

    if (tagName === 'rect' && currentCellId) {
      const fill = getPaint(attributes, 'fill');
      const stroke = getPaint(attributes, 'stroke');

      if (!(isNone(fill) && isNone(stroke))) {
        const cell = ensureCell(currentCellId);
        cell.rects.push({
          cellId: currentCellId,
          x: toNumber(attributes.x) + inheritedOffset.x,
          y: toNumber(attributes.y) + inheritedOffset.y,
          width: toNumber(attributes.width),
          height: toNumber(attributes.height),
          fill,
          stroke,
          strokeWidth: toNumber(getPresentationValue(attributes, 'stroke-width'), 1),
        });
      }
    }

    if (tagName === 'path' && currentCellId) {
      const fill = getPaint(attributes, 'fill');
      const stroke = getPaint(attributes, 'stroke');
      const d = attributes.d ?? '';
      const cellMeta = drawioCells.get(currentCellId);
      const shapeName = String(cellMeta?.style?.shape ?? '').toLowerCase();

      if ((fill === 'none' || fill === undefined) && !isNone(stroke) && d) {
        const cell = ensureCell(currentCellId);
        cell.linePaths.push({
          cellId: currentCellId,
          segments: parsePathData(d, inheritedOffset),
          stroke,
          strokeWidth: toNumber(getPresentationValue(attributes, 'stroke-width'), 1),
        });
      } else if (
        cellMeta?.vertex
        && !cellMeta?.edge
        && SUPPORTED_NON_RECT_BORDER_SHAPES.has(shapeName)
        && !isNone(stroke)
        && d
      ) {
        const segments = parsePathData(d, inheritedOffset);

        if (segments.length > 0) {
          const cell = ensureCell(currentCellId);
          cell.shapeBorders.push({
            cellId: currentCellId,
            shape: shapeName,
            segments,
            stroke,
            strokeWidth: toNumber(getPresentationValue(attributes, 'stroke-width'), 1),
          });
        }
      }
    }

    if (!selfClosing) {
      stack.push(nextContext);
    }
  }

  return cells;
}

function collectEdges(cells) {
  const edges = [];

  for (const cell of cells.values()) {
    if (cell.linePaths.length === 0) {
      continue;
    }

    for (const linePath of cell.linePaths) {
      if (linePath.segments.length === 0) {
        continue;
      }

      edges.push({
        cellId: cell.cellId,
        segments: linePath.segments,
        strokeWidth: linePath.strokeWidth,
      });
    }
  }

  return edges;
}

function collectLintRects(cells) {
  const rects = [];

  for (const cell of cells.values()) {
    for (const rect of cell.rects) {
      const lintRole = classifyRectLintRole(rect);

      if (lintRole !== 'ignore') {
        rects.push({
          ...rect,
          lintRole,
        });
      }
    }
  }

  return rects;
}

function segmentsBounds(segments) {
  let bounds = null;

  for (const segment of segments) {
    const currentBounds = segmentBounds(segment);

    if (!bounds) {
      bounds = { ...currentBounds };
      continue;
    }

    bounds.minX = Math.min(bounds.minX, currentBounds.minX);
    bounds.maxX = Math.max(bounds.maxX, currentBounds.maxX);
    bounds.minY = Math.min(bounds.minY, currentBounds.minY);
    bounds.maxY = Math.max(bounds.maxY, currentBounds.maxY);
  }

  return bounds ?? {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  };
}

function collectShapeBorders(cells) {
  const shapeBorders = [];

  for (const cell of cells.values()) {
    for (const shapeBorder of cell.shapeBorders ?? []) {
      shapeBorders.push({
        ...shapeBorder,
        bounds: segmentsBounds(shapeBorder.segments),
      });
    }
  }

  return shapeBorders;
}

function findEdgeOverlaps(edges) {
  const issues = [];

  for (let firstIndex = 0; firstIndex < edges.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < edges.length; secondIndex += 1) {
      const first = edges[firstIndex];
      const second = edges[secondIndex];

      if (first.cellId === second.cellId) {
        continue;
      }

      for (const firstSegment of first.segments) {
        const firstBounds = segmentBounds(firstSegment);

        for (const secondSegment of second.segments) {
          const secondBounds = segmentBounds(secondSegment);

          if (!boundsOverlap(firstBounds, secondBounds)) {
            continue;
          }

          const intersection = classifySegmentIntersection(firstSegment, secondSegment);

          if (!intersection) {
            continue;
          }

          issues.push({
            type: 'edge-edge',
            firstCellId: first.cellId,
            secondCellId: second.cellId,
            detail: intersection.detail,
          });
        }
      }
    }
  }

  return issues;
}

function findEdgeRectCollisions(edges, rects) {
  const issues = [];

  for (const edge of edges) {
    for (const rect of rects) {
      if (rect.lintRole !== 'obstacle') {
        continue;
      }

      if (edge.cellId === rect.cellId) {
        continue;
      }

      const bounds = rectBounds(rect);

      for (const segment of edge.segments) {
        if (!boundsOverlap(segmentBounds(segment), bounds)) {
          continue;
        }

        const innerRect = insetRect(rect, borderContactTolerance(edge, rect));
        const interiorLength = innerRect ? interiorLengthInsideRect(segment, innerRect) : 0;

        if (interiorLength > BOX_INTERIOR_THRESHOLD) {
          issues.push({
            type: 'edge-rect',
            edgeCellId: edge.cellId,
            rectCellId: rect.cellId,
            length: interiorLength,
          });
        }
      }
    }
  }

  return issues;
}

function findEdgeRectBorderOverlaps(edges, rects) {
  const issues = [];

  for (const edge of edges) {
    for (const rect of rects) {
      if (edge.cellId === rect.cellId) {
        continue;
      }

      const tolerance = borderContactTolerance(edge, rect);
      const expandedRectBounds = expandBounds(rectBounds(rect), tolerance);

      for (const segment of edge.segments) {
        if (!boundsOverlap(segmentBounds(segment), expandedRectBounds, tolerance)) {
          continue;
        }

        for (const contact of findSegmentRectBorderContacts(segment, edge, rect)) {
          issues.push({
            type: 'edge-rect-border',
            edgeCellId: edge.cellId,
            rectCellId: rect.cellId,
            side: contact.side,
            length: contact.length,
            offset: contact.offset,
          });
        }
      }
    }
  }

  return issues;
}

function rectToBorderSegments(rect) {
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;

  return [
    {
      side: 'top',
      segment: {
        start: { x: rect.x, y: rect.y },
        end: { x: right, y: rect.y },
      },
    },
    {
      side: 'right',
      segment: {
        start: { x: right, y: rect.y },
        end: { x: right, y: bottom },
      },
    },
    {
      side: 'bottom',
      segment: {
        start: { x: right, y: bottom },
        end: { x: rect.x, y: bottom },
      },
    },
    {
      side: 'left',
      segment: {
        start: { x: rect.x, y: bottom },
        end: { x: rect.x, y: rect.y },
      },
    },
  ];
}

function findEdgeShapeBorderOverlaps(edges, shapeBorders) {
  const issues = [];

  for (const edge of edges) {
    for (const shapeBorder of shapeBorders) {
      if (edge.cellId === shapeBorder.cellId) {
        continue;
      }

      const tolerance = borderContactTolerance(edge, shapeBorder);
      const expandedBounds = expandBounds(shapeBorder.bounds, tolerance);

      for (const edgeSegment of edge.segments) {
        if (!boundsOverlap(segmentBounds(edgeSegment), expandedBounds, tolerance)) {
          continue;
        }

        for (let index = 0; index < shapeBorder.segments.length; index += 1) {
          const shapeSegment = shapeBorder.segments[index];

          if (!boundsOverlap(segmentBounds(edgeSegment), segmentBounds(shapeSegment), tolerance)) {
            continue;
          }

          const intersection = classifySegmentIntersection(edgeSegment, shapeSegment);

          if (!intersection || intersection.type !== 'overlap') {
            continue;
          }

          if ((intersection.length ?? 0) <= BOX_BORDER_OVERLAP_THRESHOLD) {
            continue;
          }

          issues.push({
            type: 'edge-shape-border',
            edgeCellId: edge.cellId,
            shapeCellId: shapeBorder.cellId,
            detail: `${shapeBorder.shape} segment ${index + 1} overlap ${(intersection.length ?? 0).toFixed(1)}px`,
          });
        }
      }
    }
  }

  return issues;
}

function findRectShapeBorderOverlaps(rects, shapeBorders) {
  const issues = [];

  for (const rect of rects) {
    if (isNone(rect.stroke)) {
      continue;
    }

    const rectBorderSegments = rectToBorderSegments(rect);

    for (const shapeBorder of shapeBorders) {
      if (rect.cellId === shapeBorder.cellId) {
        continue;
      }

      const tolerance = borderContactTolerance(rect, shapeBorder);
      const expandedBounds = expandBounds(shapeBorder.bounds, tolerance);

      for (const rectBorder of rectBorderSegments) {
        if (!boundsOverlap(segmentBounds(rectBorder.segment), expandedBounds, tolerance)) {
          continue;
        }

        for (let index = 0; index < shapeBorder.segments.length; index += 1) {
          const shapeSegment = shapeBorder.segments[index];

          if (!boundsOverlap(segmentBounds(rectBorder.segment), segmentBounds(shapeSegment), tolerance)) {
            continue;
          }

          const intersection = classifySegmentIntersection(rectBorder.segment, shapeSegment);

          if (!intersection || intersection.type !== 'overlap') {
            continue;
          }

          if ((intersection.length ?? 0) <= BOX_BORDER_OVERLAP_THRESHOLD) {
            continue;
          }

          issues.push({
            type: 'rect-shape-border',
            rectCellId: rect.cellId,
            shapeCellId: shapeBorder.cellId,
            detail: `${rectBorder.side} side with ${shapeBorder.shape} segment ${index + 1} overlap ${(intersection.length ?? 0).toFixed(1)}px`,
          });
        }
      }
    }
  }

  return issues;
}

function summarizeIssues(issues) {
  const summaries = new Map();

  for (const issue of issues) {
    if (issue.type === 'text-contrast') {
      const key = `${issue.type}::${issue.cellId}`;

      if (!summaries.has(key)) {
        summaries.set(key, {
          type: 'text-contrast',
          cellId: issue.cellId,
          label: issue.label,
          contrastRatio: issue.contrastRatio,
          threshold: issue.threshold,
          fontColor: issue.fontColor,
          fillColor: issue.fillColor,
        });
      }

      continue;
    }

    if (issue.type === 'text-emphasis') {
      const key = `${issue.type}::${issue.cellId}`;

      if (!summaries.has(key)) {
        summaries.set(key, {
          type: 'text-emphasis',
          cellId: issue.cellId,
          label: issue.label,
          lineCount: issue.lineCount,
          fontSize: issue.fontSize,
          widthRatio: issue.widthRatio,
          topInset: issue.topInset,
          fillColor: issue.fillColor,
          fontColor: issue.fontColor,
        });
      }

      continue;
    }

    if (issue.type === 'edge-edge') {
      const key = `${issue.firstCellId}::${issue.secondCellId}`;

      if (!summaries.has(key)) {
        summaries.set(key, {
          type: 'edge-edge',
          firstCellId: issue.firstCellId,
          secondCellId: issue.secondCellId,
          details: new Set(),
        });
      }

      summaries.get(key).details.add(issue.detail);
      continue;
    }

    if (issue.type === 'text-overflow') {
      const key = `${issue.cellId}::${issue.axis}`;

      if (!summaries.has(key)) {
        summaries.set(key, {
          type: 'text-overflow',
          axis: issue.axis,
          cellId: issue.cellId,
          available: issue.available,
          estimated: issue.estimated,
          label: issue.label,
        });
      } else {
        const summary = summaries.get(key);
        summary.available = Math.min(summary.available, issue.available);
        summary.estimated = Math.max(summary.estimated, issue.estimated);
      }

      continue;
    }

    if (issue.type === 'edge-terminal') {
      const key = `${issue.type}::${issue.edgeCellId}::${issue.position}`;

      if (!summaries.has(key)) {
        summaries.set(key, {
          type: 'edge-terminal',
          edgeCellId: issue.edgeCellId,
          position: issue.position,
          minLength: issue.length,
          count: 1,
        });
        continue;
      }

      const summary = summaries.get(key);
      summary.minLength = Math.min(summary.minLength, issue.length);
      summary.count += 1;
      continue;
    }

    if (issue.type === 'edge-label') {
      const key = `${issue.type}::${issue.edgeCellId}::${issue.labelCellId}`;

      if (!summaries.has(key)) {
        summaries.set(key, {
          type: 'edge-label',
          edgeCellId: issue.edgeCellId,
          labelCellId: issue.labelCellId,
          label: issue.label,
          maxLength: issue.length,
          count: 1,
        });
        continue;
      }

      const summary = summaries.get(key);
      summary.maxLength = Math.max(summary.maxLength, issue.length);
      summary.count += 1;
      continue;
    }

    if (issue.type === 'label-rect') {
      const key = `${issue.type}::${issue.labelCellId}::${issue.rectCellId}`;

      if (!summaries.has(key)) {
        summaries.set(key, {
          type: 'label-rect',
          labelCellId: issue.labelCellId,
          rectCellId: issue.rectCellId,
          label: issue.label,
          maxArea: issue.area,
          maxWidth: issue.width,
          maxHeight: issue.height,
          count: 1,
        });
        continue;
      }

      const summary = summaries.get(key);
      summary.maxArea = Math.max(summary.maxArea, issue.area);
      summary.maxWidth = Math.max(summary.maxWidth, issue.width);
      summary.maxHeight = Math.max(summary.maxHeight, issue.height);
      summary.count += 1;
      continue;
    }

    if (issue.type === 'edge-rect-border') {
      const key = `${issue.type}::${issue.edgeCellId}::${issue.rectCellId}`;

      if (!summaries.has(key)) {
        summaries.set(key, {
          type: 'edge-rect-border',
          edgeCellId: issue.edgeCellId,
          rectCellId: issue.rectCellId,
          details: new Set(),
        });
      }

      summaries.get(key).details.add(`${issue.side} overlap ${issue.length.toFixed(1)}px (offset ${issue.offset.toFixed(1)}px)`);
      continue;
    }

    if (issue.type === 'edge-shape-border') {
      const key = `${issue.type}::${issue.edgeCellId}::${issue.shapeCellId}`;

      if (!summaries.has(key)) {
        summaries.set(key, {
          type: 'edge-shape-border',
          edgeCellId: issue.edgeCellId,
          shapeCellId: issue.shapeCellId,
          details: new Set(),
        });
      }

      summaries.get(key).details.add(issue.detail);
      continue;
    }

    if (issue.type === 'rect-shape-border') {
      const key = `${issue.type}::${issue.rectCellId}::${issue.shapeCellId}`;

      if (!summaries.has(key)) {
        summaries.set(key, {
          type: 'rect-shape-border',
          rectCellId: issue.rectCellId,
          shapeCellId: issue.shapeCellId,
          details: new Set(),
        });
      }

      summaries.get(key).details.add(issue.detail);
      continue;
    }

    const key = `${issue.type}::${issue.edgeCellId}::${issue.rectCellId}`;

    if (!summaries.has(key)) {
      summaries.set(key, {
        type: 'edge-rect',
        edgeCellId: issue.edgeCellId,
        rectCellId: issue.rectCellId,
        maxLength: issue.length,
        count: 1,
      });
      continue;
    }

    const summary = summaries.get(key);
    summary.maxLength = Math.max(summary.maxLength, issue.length);
    summary.count += 1;
  }

  return [...summaries.values()];
}

function formatIssue(issue) {
  if (issue.type === 'edge-edge') {
    const details = [...issue.details].sort();
    return `- edge-edge: ${issue.firstCellId} <-> ${issue.secondCellId} (${details.length} contact(s): ${details.join('; ')})`;
  }

  if (issue.type === 'text-contrast') {
    return `- text-contrast: ${issue.cellId} has only ${issue.contrastRatio.toFixed(2)}:1 contrast against ${issue.fillColor} with ${issue.fontColor}; target at least ${issue.threshold.toFixed(1)}:1 [${issue.label}]`;
  }

  if (issue.type === 'text-emphasis') {
    return `- text-emphasis: ${issue.cellId} is a dense dark card with flat title/body treatment (${issue.lineCount} lines, width fill ${(issue.widthRatio * 100).toFixed(0)}%) [${issue.label}]`;
  }

  if (issue.type === 'text-overflow') {
    return `- text-overflow(${issue.axis}): ${issue.cellId} requires ${issue.estimated.toFixed(1)}px but only ${issue.available.toFixed(1)}px is available [${issue.label}]`;
  }

  if (issue.type === 'edge-terminal') {
    return `- edge-terminal: ${issue.edgeCellId} has a too-short ${issue.position} segment (${issue.minLength.toFixed(1)}px across ${issue.count} segment(s)); keep at least ${MIN_TERMINAL_SEGMENT_LENGTH}px of straight run near arrowheads`;
  }

  if (issue.type === 'edge-label') {
    return `- edge-label: ${issue.edgeCellId} crosses label text in ${issue.labelCellId} (max interior ${issue.maxLength.toFixed(1)}px across ${issue.count} segment(s)) [${issue.label}]`;
  }

  if (issue.type === 'label-rect') {
    return `- label-rect: ${issue.labelCellId} overlaps ${issue.rectCellId} (${issue.maxWidth.toFixed(1)}px x ${issue.maxHeight.toFixed(1)}px, max area ${issue.maxArea.toFixed(1)}px) [${issue.label}]`;
  }

  if (issue.type === 'edge-rect-border') {
    const details = [...issue.details].sort();
    return `- edge-rect-border: ${issue.edgeCellId} -> ${issue.rectCellId} (${details.length} contact(s): ${details.join('; ')})`;
  }

  if (issue.type === 'edge-shape-border') {
    const details = [...issue.details].sort();
    return `- edge-shape-border: ${issue.edgeCellId} -> ${issue.shapeCellId} (${details.length} contact(s): ${details.join('; ')})`;
  }

  if (issue.type === 'rect-shape-border') {
    const details = [...issue.details].sort();
    return `- rect-shape-border: ${issue.rectCellId} -> ${issue.shapeCellId} (${details.length} contact(s): ${details.join('; ')})`;
  }

  return `- edge-rect: ${issue.edgeCellId} -> ${issue.rectCellId} (max interior ${issue.maxLength.toFixed(1)}px across ${issue.count} segment(s))`;
}

function printUsage() {
  console.log('Usage: node scripts/check-drawio-svg-overlaps.mjs <diagram.drawio|diagram.drawio.svg>');
}

async function main() {
  const targetArg = process.argv[2];

  if (!targetArg) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const targetPath = resolveTargetPath(targetArg);
  const companionDrawio = await readCompanionDrawio(targetPath, targetArg);
  const drawioCellMetadata = companionDrawio ? parseDrawioCellMetadata(companionDrawio.text) : new Map();
  const svgText = await readFile(targetPath, 'utf8');
  const cells = parseSvg(svgText, drawioCellMetadata);
  const edges = collectEdges(cells);
  const rects = collectLintRects(cells);
  const shapeBorders = collectShapeBorders(cells);
  const edgeIssues = findEdgeOverlaps(edges);
  const rectIssues = findEdgeRectCollisions(edges, rects);
  const rectBorderIssues = findEdgeRectBorderOverlaps(edges, rects);
  const terminalIssues = findShortTerminalSegments(edges);
  const edgeShapeBorderIssues = findEdgeShapeBorderOverlaps(edges, shapeBorders);
  const rectShapeBorderIssues = findRectShapeBorderOverlaps(rects, shapeBorders);
  const textLayouts = companionDrawio ? parseDrawioTextLayouts(companionDrawio.text) : [];
  const textBlocks = textLayouts;
  const labelBoxes = textLayouts
    .filter((layout) => layout.isTextCell && layout.labelBox.width > 0 && layout.labelBox.height > 0)
    .map((layout) => layout.labelBox);
  const textIssues = findTextOverflowIssues(textBlocks);
  const textContrastIssues = findTextContrastIssues(textBlocks);
  const textEmphasisIssues = findTextEmphasisIssues(textBlocks);
  const labelIssues = findEdgeLabelCollisions(edges, labelBoxes);
  const drawioRects = companionDrawio ? parseDrawioRectLayouts(companionDrawio.text) : [];
  const labelRectIssues = findLabelRectOverlaps(labelBoxes, drawioRects);
  const issues = summarizeIssues([
    ...edgeIssues,
    ...rectIssues,
    ...rectBorderIssues,
    ...terminalIssues,
    ...edgeShapeBorderIssues,
    ...rectShapeBorderIssues,
    ...labelIssues,
    ...labelRectIssues,
    ...textIssues,
    ...textContrastIssues,
    ...textEmphasisIssues,
  ]);

  console.log(`[diagram:check] ${path.relative(process.cwd(), targetPath)}`);
  console.log(`[diagram:check] parsed ${cells.size} cells, ${edges.length} edges, ${rects.length} lint rects, ${shapeBorders.length} shape borders`);

  if (companionDrawio) {
    console.log(`[diagram:check] parsed ${textBlocks.length} text block(s) and ${labelBoxes.length} label box(es) from ${path.relative(process.cwd(), companionDrawio.path)}`);
  }

  if (issues.length === 0) {
    console.log('[diagram:check] OK: no overlaps, border rides, short arrow runs, label intrusions, label-box collisions, text contrast problems, text emphasis problems, or text overflows detected by the current heuristics');
    return;
  }

  console.log(`[diagram:check] found ${issues.length} issue(s)`);
  for (const issue of issues) {
    console.log(formatIssue(issue));
  }

  process.exitCode = 1;
}

await main();
