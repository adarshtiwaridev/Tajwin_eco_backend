<div align="center">

Tajwin Eco Backend

A modular, role-based backend for product, order, dealership, retailer, and inventory operations.

<p>
  <img src="docs/architecture.png" alt="Tajwin Eco Backend architecture diagram" width="100%" />
</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-API-000000?logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Mongoose-ODM-880000" alt="Mongoose" />
  <img src="https://img.shields.io/badge/API-Versioned%20(v1)-blue" alt="Versioned API" />
  <img src="https://img.shields.io/badge/Architecture-Controller%20%7C%20Service%20%7C%20Repository-purple" alt="Layered architecture" />
</p>

A clean, modular API foundation for a multi-role commerce and distribution platform.

</div>

📌 Overview

Tajwin Eco Backend is a Node.js and Express.js API organized around business modules and a Controller–Service–Repository architecture. It provides the backend foundation for platform administration, authentication and authorization, dealership and retailer operations, product and order management, and inventory workflows.

The application uses MongoDB with Mongoose for persistence and exposes versioned routes through the API runtime. Validation, authentication, permissions, centralized error handling, media upload utilities, and API documentation are separated into reusable components.

Architecture note: This README describes the structure visible in the repository. Check API_DOCUMENTATION.md and the route/validator files for the authoritative endpoint list, request schemas, and current implementation status.

✨ Key Areas

Area

Responsibility

🔐 Authentication & access

Authentication flows, role definitions, permissions, and access-control middleware

🛡️ Platform administration

Admin operations and role administration

🤝 Dealership operations

Dealership data, service, repository, validation, and routes

🏪 Retailer operations

Retailer data, service, repository, validation, and routes

📦 Product management

Product workflows, media validation/upload, Cloudinary utilities, and persistence

🧾 Order management

Order model, constants, validation, repository, service, and controller

🏬 Inventory operations

Inventory records, warehouses, stock allocations, movements, delivery records, and activity logs

📊 Dashboard

Dashboard controller, service, and route layer

🧰 Shared infrastructure

Database connection, environment configuration, logging, response helpers, validation, and error handling

🧱 Architecture

The codebase follows a layered structure intended to keep HTTP concerns, business rules, and data access separate.

flowchart TD
    Client[API Client / Frontend] --> App[Express Application<br/>src/app.js]
    App --> V1[Versioned Routes<br/>src/routes/v1/index.js]
    V1 --> MW[Middleware<br/>Auth · Permissions · Validation]
    MW --> Controllers[Module Controllers]
    Controllers --> Services[Business Services]
    Services --> Repositories[Repositories]
    Repositories --> Models[Mongoose Models]
    Models --> DB[(MongoDB)]

    Services --> Media[Cloudinary / Media Utilities]
    App --> Errors[Central Error Handler]
    Controllers --> Response[Response Helpers]

Request lifecycle

A client sends an HTTP request to the Express application.

The app mounts the versioned API routes.

Middleware performs the applicable authentication, permission, security, and validation checks.

A controller handles HTTP-level input and delegates business work to a service.

The service applies business rules and calls a repository or supporting utility.

The repository interacts with Mongoose models and MongoDB.

A consistent response or centralized error handler returns the result to the client.

🗂️ Project Structure

tajwin_eco_backend/
├── README.md
├── API_DOCUMENTATION.md
├── package.json
├── seedadmin.js
├── migrate.js
├── unmigrate.js
├── migration_mappings.json
├── scripts/
│   ├── build_full_postman_collection.js
│   ├── update_postman.js
│   ├── update_postman_collection.js
│   └── verify_inventory.js
└── src/
    ├── app.js
    ├── server.js
    ├── common/
    │   ├── ApiError.js
    │   └── responseHelper.js
    ├── config/
    │   ├── cloudinary.js
    │   ├── env.js
    │   ├── logger.js
    │   └── upload.config.js
    ├── core/
    │   └── repository.js
    ├── database/
    │   └── dbConnect.js
    ├── middlewares/
    │   ├── authMiddleware.js
    │   ├── error.middleware.js
    │   ├── permissionMiddleware.js
    │   ├── security.js
    │   └── validate.js
    ├── modules/
    │   ├── admin/
    │   │   ├── controller.js
    │   │   ├── dto.js
    │   │   ├── index.js
    │   │   ├── repository.js
    │   │   ├── route.js
    │   │   ├── service.js
    │   │   ├── validator.js
    │   │   ├── inventory/
    │   │   ├── order/
    │   │   └── product/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── delship/
    │   ├── enduser/
    │   ├── retailer/
    │   └── roles/
    ├── routes/
    │   └── v1/
    │       └── index.js
    └── utils/
        ├── apiFeatures.js
        ├── apiResponse.js
        └── asyncHandler.js

<details>
<summary><strong>📁 Module details</strong></summary>

modules/admin/ — administrative workflows and nested product, order, and inventory modules.

modules/auth/ — authentication controller/service/model, DTOs, validators, role constants, and permissions.

modules/dashboard/ — dashboard routes, controller, and service.

modules/delship/ — dealership-related model and business layers.

modules/retailer/ — retailer-related model and business layers.

modules/enduser/ — end-user model.

modules/roles/ — role management components.

middlewares/ — reusable authentication, permission, security, validation, and error-handling middleware.

config/ — environment, logging, upload, and Cloudinary configuration.

scripts/ — Postman collection utilities and inventory verification helpers.

migrate.js / unmigrate.js — migration and rollback utilities; inspect their prompts and configuration before running them.

</details>

🛠️ Technology Stack

Runtime: Node.js

HTTP framework: Express.js

Database: MongoDB

ODM: Mongoose

Authentication and authorization: repository-specific auth middleware, roles, and permissions

Media handling: Cloudinary integration and upload middleware

Validation: shared validation middleware and module-level validators

API testing/documentation: Postman collection scripts and API_DOCUMENTATION.md

The exact package versions and available scripts are defined in package.json.

🚀 Getting Started

Prerequisites

Install the following before starting:

Node.js version compatible with the project

npm

A reachable MongoDB database (local or hosted)

Cloudinary credentials if using product/media upload features

1. Clone the repository

git clone https://github.com/adarshtiwaridev/tajwin_eco_backend.git
cd tajwin_eco_backend

If your repository URL differs, replace the clone URL with the correct repository URL.

2. Install dependencies

npm install

3. Configure environment variables

Create a .env file in the project root. Use the variable names expected by src/config/env.js, src/database/dbConnect.js, and src/config/cloudinary.js.

Example template — confirm the names against your code before running:

NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/tajwin_eco_backend

# Add the exact Cloudinary variable names required by src/config/cloudinary.js
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Add authentication secrets required by the auth implementation
JWT_SECRET=
JWT_EXPIRES_IN=1d

Security: Never commit .env, database credentials, JWT secrets, or production API keys. Keep .env.example limited to placeholder values.

4. Start the server

Check the scripts section of package.json for the supported commands. If the project defines the common scripts, use:

npm run dev

For production, use the project's configured start script:

npm start

Do not assume a command exists until it has been confirmed in package.json.

5. Verify the API

Review API_DOCUMENTATION.md.

Import or generate the Postman collection using the scripts under scripts/.

Test the health/root endpoint if one is defined in src/app.js.

Confirm database connectivity in the application logs.

Test protected routes with the expected authentication token and role.

🔌 API Organization

The API is mounted through src/routes/v1/index.js. The exact prefixes and HTTP methods should be confirmed from that file and the module route files.

Domain

Route/module entry points

Authentication

src/modules/auth/route.js

Admin

src/modules/admin/route.js

Dealership

src/modules/delship/route.js

Retailer

src/modules/retailer/route.js

Roles

src/modules/roles/route.js

Dashboard

src/modules/dashboard/route.js

Products

src/modules/admin/product/routes/product.routes.js

Orders

src/modules/admin/order/routes/order.routes.js

Inventory

src/modules/admin/inventory/routes/inventory.routes.js

For endpoint-by-endpoint details, request payloads, authentication requirements, and response examples, use API_DOCUMENTATION.md and the corresponding validators/controllers.

🔒 Security & Reliability

Before deploying or exposing the API publicly:

Keep secrets in environment variables and configure them in the hosting provider.

Validate and normalize incoming request data at the API boundary.

Apply authentication and role/permission checks to every protected route.

Confirm upload type, size, and content validation for media endpoints.

Use centralized error handling without leaking stack traces or secrets in production.

Add rate limiting and appropriate security headers where needed.

Review CORS origins and allowed HTTP methods.

Ensure database users have least-privilege access and production MongoDB network rules are restricted.

Add automated tests for authorization failures, invalid input, duplicate records, and inventory consistency.

Back up production data and test migration/rollback procedures before executing them.

🧪 Testing & Developer Utilities

The repository includes helper scripts for Postman collections and inventory verification:

scripts/build_full_postman_collection.js
scripts/update_postman.js
scripts/update_postman_collection.js
scripts/verify_inventory.js

Inspect package.json to confirm the command associated with each script. Run migration or rollback utilities only after reviewing the mapping file, environment, backup strategy, and expected impact.

🚢 Deployment Checklist

Set the required environment variables in the hosting dashboard.

Confirm the production MongoDB URI and network access rules.

Configure Cloudinary credentials if media upload is enabled.

Verify the production start command in package.json.

Confirm no deployment step depends on a local .env file being committed.

Run API smoke tests and key Postman scenarios.

Test authentication, roles, and permission-denied responses.

Verify product media uploads and inventory workflows.

Check logs for database, validation, and unhandled errors.

Confirm migrations and seed scripts are safe to run in the target environment.

🤝 Contributing

Create a feature branch.

Keep changes scoped to the relevant module.

Follow the existing controller/service/repository conventions.

Add or update validators and API documentation when changing an endpoint.

Test success cases, invalid input, and permission failures.

Open a pull request with a clear summary and test notes.

📚 Documentation

API reference: API_DOCUMENTATION.md

Architecture diagram: docs/architecture.png

Package scripts and dependencies: package.json

📄 License

Add the project's chosen license here before publishing or distributing the repository.

<div align="center">

Tajwin Eco Backend · Modular APIs · Secure access · Structured business logic

</div>
