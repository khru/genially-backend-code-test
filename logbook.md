# The though process

## Node version with NVM

I open the IDE check the package.json file see that the node version is there, so I added a `.nvmrc` file
How to use it:

```bash
nvm install
nvm use
```

## Standards on the project

I've saw that there was not a `.editorconfig` and I added so the IDE knows the standards of the project.

## Testing framework

I saw that there is not a testing framework, so I install jest and supertest.

```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

The reason is straightforward; I needed a way of testing the API as well as the internals, so with supertest I can test
the calls to the API
I've also configured the `jest.config.ts` file.

After this I've created a test of the healthcheck.

Now that I have the IDE using the right formatting and that I have a testing framework I can start with the
functionality.

Then I created and ADR to justify my decision.

## Making the first TDD cycle to create a genially

I've created the first acceptance test, while I was working on it, I identify a bug on the InMemoryRepository as well as
an unexpected behavior on it so I cover it with test and make the test, after that I've updated the test to cover the
behavior I change.

From there I move to finish the "use case".

## Adding http client for all the use cases

Being an API, is important to test the behaviors, having behaviors that are not simple to evaluate with the browser I've
asked Moi and Noel about the IDE that the use and they mention that was WebStorm, so I decided to use the http client
from the IDE

## Finalizing the genially use cases for step 1

I've done all the steps from the first part of the interview process with the InMemoryDatabase

## Adding pipelines

I've added pipelines for linting, testing and building the project, if this was a real project the security part would
be missing as well as the building an image with the API to be deployed setting also the deployment strategy.

## Context on the first part of the interview

I've decided to only use Acceptance and unit test, because there is not any awkward dependency that force me to do
integration test, I've also created some test with TDD, but for the testing strategy that I was following were not
needed, so I erased them.

## Moving to MongoDB

I've created an ADR to justify the decision of using migrate-mongo, then I've created the folder, I've added this only
for local development, although this is only an interview I always try to think on how I would work with this, in case I
need to change it in the future. This is not important, and it was not requiered, I only added because it was part of my
thought process.

## Adding Open API

I've added OpenAPI to the project because I think it could be an important part of the use of an API, obviously this is
not part of the interview, so I just added because it was part of my thought process.

## Added Makefile

Due to the mongo-migration "project" this could impact the DX of the project, so I've added a Makefile to simplify
