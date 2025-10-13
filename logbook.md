# The though process

## Node version with NVM

I open the IDE check the package.json file see that the node version is there, so I added a `.nvmrc` file
How to use it:

```bash
nvm install
nvm use
```

## Standards on the project

I've sawed that there was not a `.editorconfig` and I added so the IDE knows the standards of the project.

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
an unexpected behavior on it, so I cover it with test and make the test, after that I've updated the test to cover the
behavior I change.

From there I move to finish the "use case".

## Adding an http client for all the use cases

Being an API is important to test the behaviors, having behaviors that are not simple to evaluate with the browser I've
asked Moi and Noel about the IDE that they use. They mention that was WebStorm, so I decided to use the http client
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

## Adding configuration pattern to allow multiple databases base on configuration

I've added a configuration pattern to allow multiple databases based on configuration, this is important because
it allows changing the database without changing the code, this is important because in a real project

I've also seen that this could be maybe too complex, so I've decided to replace it with only one database connection
with
MongoDB.

## Adding Dependency Injection container

I've added a DI container to the project because I think it is important to have a way to manage dependencies, this is
important because it allows changing the implementation of a dependency without changing the code, or as less as
possible

I've used `awilix` to avoid decorator with `@` and the magic that they can do, that can be confusing sometimes.

I've migrated the code from a manual Configuration pattern to a DI container, and then I've remove the use of the two
databases based on the configuration.

## Move to the final stage

I've just taken it as the low-hanging fruit, I've added some types to the project, as well as some final polish.

I am also thinking of implementing it by using domain events, but I think that was not needed for the interview, or it
could have been an overengineering.

## Final thoughts

I've like a lot the interview, I think that was a good experience, the only downside I've seen is that the behavior for
the exercise is a simple CRUD, with no real business logic, that's why I've also taken some turns that I would not do
it on a real project, like a better testing strategy, or using API first with OpenAPI, ensuring that domain objects are
tighter to the domain and not to the infrastructure.

### Testing strategy

Usually in projects like this I'd like to use a testing strategy, of acceptance tests that will be a black box,
asserting the output of the system (like the ones I've done mostly),
Then I usually do narrow integration tests, where I use unit test to cover the use cases or services doubling the
dependencies, and finally I do a narrow integrating test, against a test container or a system that will ensure that
that connection and storage will work.
I also use "integration test / sociable test" to cover most of the parts where I do not need a test double or a need to
create a boundary.

In case that I need also to test some side effect like calling a queue or an external system, I usually do subcutaneous
acceptance tests for systems that are on the teams control. If the system is not under our control, I usually do
contract tests with "PACT" or similar tools, you could try to do it with openapi, but I think that is not the best tool
for the job.

### Because I've also done a lot of tests for the configuration of the system

And some things related to configuring the project, I've not added test. The behavior from the system
perspective is different from that the user perspective, I did not like some tests I've done, for that reason I've
decided to use mutant testing to see the weakness of the test, so I can improve them.
