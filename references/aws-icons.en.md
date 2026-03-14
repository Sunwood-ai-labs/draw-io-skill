# AWS Icons And Service Names

## 1. Official Naming

Use official AWS product names instead of abbreviations where possible.

| Prefix | Examples |
|--------|----------|
| Amazon | Amazon ECS, Amazon ECR, Amazon S3, Amazon RDS, Amazon CloudWatch |
| AWS | AWS Lambda, AWS IAM, AWS CloudFormation, AWS Step Functions |
| Elastic | Elastic Load Balancing |

- Avoid abbreviation-only labels such as `ECS` when the formal name matters.
- Keep naming consistent across labels, legend text, and documentation.

## 2. draw.io Icon Styles

### 2.1 Resource icons

```xml
shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.{service_name};
```

### 2.2 Product icons

```xml
shape=mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.{service_name};
```

### 2.3 Notes

- Prefer `mxgraph.aws4.*`; `aws3` is legacy-only.
- Use the snake_case service names expected by draw.io.

## 3. Search Helper

Use the bundled helper to find the icon identifier you need:

```bash
uv run python scripts/find_aws_icon.py ec2
uv run python scripts/find_aws_icon.py lambda
uv run python scripts/find_aws_icon.py cloudwatch
```

## 4. Common Service Identifiers

| Service | draw.io id |
|---------|------------|
| Amazon EC2 | `mxgraph.aws4.ec2` |
| Amazon ECS | `mxgraph.aws4.ecs` |
| Amazon EKS | `mxgraph.aws4.eks` |
| Amazon ECR | `mxgraph.aws4.ecr` |
| AWS Lambda | `mxgraph.aws4.lambda` |
| Amazon RDS | `mxgraph.aws4.rds` |
| Amazon S3 | `mxgraph.aws4.s3` |
| Amazon CloudWatch | `mxgraph.aws4.cloudwatch` |
| AWS Step Functions | `mxgraph.aws4.step_functions` |
| Amazon API Gateway | `mxgraph.aws4.api_gateway` |

## 5. Diagram Hygiene

- Use icons to clarify architecture, not to decorate empty space.
- Keep icon styles consistent within one diagram.
- Prefer service labels that remain readable without relying on the icon alone.
- Re-run SVG lint after major routing changes around icon-heavy layouts.
