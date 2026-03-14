# Layout Guidelines

## 1. Grouping Principles

- Use the AWS Cloud group as the outermost frame.
- Create sub-groups around functional boundaries.
- Prefer left-to-right placement that matches the data flow.

### 1.1 Suggested hierarchy

```text
AWS Cloud (outer frame)
├── VPC
│   ├── Public Subnet
│   │   └── ALB, NAT Gateway, and similar entry points
│   └── Private Subnet
│       └── ECS, RDS, and internal services
├── S3
├── CloudWatch
└── Other shared services
```

## 2. Connector Rules

### 2.1 Line styles

| Flow type | Style | Intended use |
|-----------|-------|--------------|
| Ingestion Flow | Dashed | Data intake |
| Query Flow | Solid | Queries and reads |
| Control Flow | Dotted | Control and management |

### 2.2 Arrow direction

- Keep arrows aligned with the actual direction of data or control.
- Use bidirectional arrows only for true bidirectional communication.

## 3. Placement Rules

### 3.1 Prefer left-to-right flow

```text
[Data Source] -> [Processing] -> [Storage] -> [Analytics / Visualization]
```

### 3.2 Alternative top-to-bottom flow

```text
[User / Client]
        |
        v
[Load Balancer]
        |
        v
[Application]
        |
        v
[Database]
```

## 4. Readability Checks

- Keep labels close to the shape they describe.
- Reposition nodes so arrows do not cross unless the crossing is intentionally accepted.
- Place related components close enough that grouping remains obvious.
- Preserve enough whitespace that the diagram can be scanned at a glance.
