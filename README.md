# Makeup Wishlist API

A NestJS backend application for managing makeup product wishlists and collections.

## Technologies Used

- NestJS - A progressive Node.js framework for building efficient, reliable, and scalable server-side applications
- PostgreSQL - Open-source relational database
- Prisma - Modern ORM for Node.js and TypeScript
- Docker - Containerization platform
- JWT - JSON Web Tokens for authentication
- Swagger - API documentation
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Features

- User authentication and authorization
- Manage makeup products and categories
- Create and organize wishlists
- Group items into collections
- RESTful API endpoints

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- Docker and Docker Compose
- npm or yarn

### Setup and Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/makeup-wishlist.git
cd makeup-wishlist
```

2. Install dependencies:

```bash
npm install
```

3. Start the database (PostgreSQL):

```bash
npm run docker:up
```

4. Run Prisma migrations:

```bash
npm run prisma:migrate:dev
```

5. Seed the database with initial data:

```bash
npm run prisma:seed
```

6. Start the application:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`, and the Swagger documentation at `http://localhost:3000/api/docs`.

### Docker Setup

You can also run the entire application with PostgreSQL using Docker.

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/makeup_wishlist?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
NODE_ENV=development
```

## API Documentation

The API documentation is available at `/api/docs` endpoint when the application is running.

## Demo User

After running the seed command, you can use the following credentials to test the API:

- Email: demo@example.com
- Password: password123

## Project Structure

```
src/
  ├── auth/              # Authentication module
  ├── categories/        # Categories module
  ├── collections/       # Collections module
  ├── common/            # Shared decorators, guards, and interfaces
  ├── config/            # Configuration module
  ├── prisma/            # Prisma service and module
  ├── products/          # Products module
  ├── users/             # Users module
  ├── wishlist-items/    # Wishlist items module
  ├── app.controller.ts  # Main app controller
  ├── app.module.ts      # Main app module
  ├── app.service.ts     # Main app service
  └── main.ts            # Application entry point
```

## License

[MIT](LICENSE)
