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
The reason is straightforward; I needed a way of testing the API as well as the internals, so with supertest I can test the calls to the API
I've also configured the `jest.config.ts` file.

After this I've created a test of the healthcheck.

Now that I have I have the IDE using the right formatting and that I have a testing framework I can start with the functionality.

