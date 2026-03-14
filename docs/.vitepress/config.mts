import { defineConfig } from "vitepress";

const repo = "https://github.com/Sunwood-ai-labs/draw-io-skill";
const penpenHeader = "https://raw.githubusercontent.com/Sunwood-ai-labs/draw-io-skill/refs/heads/main/assets/draw-io-skill-penpen-header.webp";

export default defineConfig({
  title: "draw-io-skill",
  description: "Native draw.io workflows, export helpers, and SVG linting for agent-driven repositories.",
  base: "/draw-io-skill/",
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/webp", href: penpenHeader }],
    ["meta", { property: "og:title", content: "draw-io-skill" }],
    ["meta", { property: "og:description", content: "Native draw.io workflows, export helpers, and SVG linting for agent-driven repositories." }],
    ["meta", { property: "og:image", content: penpenHeader }]
  ],
  themeConfig: {
    logo: penpenHeader,
    socialLinks: [{ icon: "github", link: repo }]
  },
  locales: {
    root: {
      label: "English",
      lang: "en-US",
      title: "draw-io-skill",
      description: "Native draw.io workflows, export helpers, and SVG linting for agent-driven repositories.",
      themeConfig: {
        nav: [
          { text: "Get Started", link: "/guide/getting-started" },
          { text: "Architecture", link: "/guide/architecture" },
          { text: "Troubleshooting", link: "/guide/troubleshooting" },
          { text: "GitHub", link: repo }
        ],
        sidebar: {
          "/guide/": [
            {
              text: "Guide",
              items: [
                { text: "Getting Started", link: "/guide/getting-started" },
                { text: "Architecture", link: "/guide/architecture" },
                { text: "Workflow", link: "/guide/workflow" },
                { text: "Export And Lint", link: "/guide/export-and-lint" },
                { text: "Reference Guides", link: "/guide/reference-guides" },
                { text: "Troubleshooting", link: "/guide/troubleshooting" }
              ]
            }
          ]
        },
        outlineTitle: "On this page",
        editLink: {
          pattern: "https://github.com/Sunwood-ai-labs/draw-io-skill/edit/main/docs/:path",
          text: "Edit this page on GitHub"
        },
        footer: {
          message: "Released under the MIT License.",
          copyright: "Copyright © Sunwood-ai-labs"
        }
      }
    },
    ja: {
      label: "日本語",
      lang: "ja-JP",
      link: "/ja/",
      title: "draw-io-skill",
      description: "native .drawio ワークフロー、export helper、SVG lint をまとめた公開向けスキル。",
      themeConfig: {
        nav: [
          { text: "はじめに", link: "/ja/guide/getting-started" },
          { text: "アーキテクチャ", link: "/ja/guide/architecture" },
          { text: "トラブルシューティング", link: "/ja/guide/troubleshooting" },
          { text: "GitHub", link: repo }
        ],
        sidebar: {
          "/ja/guide/": [
            {
              text: "ガイド",
              items: [
                { text: "はじめに", link: "/ja/guide/getting-started" },
                { text: "アーキテクチャ", link: "/ja/guide/architecture" },
                { text: "ワークフロー", link: "/ja/guide/workflow" },
                { text: "Export と lint", link: "/ja/guide/export-and-lint" },
                { text: "Reference ガイド", link: "/ja/guide/reference-guides" },
                { text: "トラブルシューティング", link: "/ja/guide/troubleshooting" }
              ]
            }
          ]
        },
        outlineTitle: "このページの内容",
        editLink: {
          pattern: "https://github.com/Sunwood-ai-labs/draw-io-skill/edit/main/docs/:path",
          text: "GitHub でこのページを編集"
        },
        footer: {
          message: "MIT License で公開しています。",
          copyright: "Copyright © Sunwood-ai-labs"
        }
      }
    }
  }
});
