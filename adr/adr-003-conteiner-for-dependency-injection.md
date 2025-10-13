# Architecture Decision Record 003: Selecting a Dependency Injection container for Node.js

**Status:** Accepted
**Updated:** 2025-10-13
**Related decisions:**

## Summary

I need a Dependency Injection container that fits a Hexagonal architecture in Node.js while prioritising explicit
configuration, minimal hidden behavior, simple migration from a configuration pattern, request-scoped lifecycles, and
easy test doubles. After evaluating Awilix, InversifyJS, tsyringe, TypeDI, BottleJS, node-dependency-injection, NestJS’s
built-in container, and continuing without a container, I choose **Awilix** in **classic injection mode** with explicit
registrations.

## Context

* I am coming from a **configuration pattern** with an explicit composition root inside a Hexagonal architecture (ports
  and adapters).
* I must **migrate first** to a container and then **remove the in-memory database** that the application will no longer
  use.
* I strongly prefer **low hidden behavior**, no mandatory decorators, no reflection metadata, and explicit wiring that
  is easy to audit.
* I require **request-scoped lifecycles**, straightforward overrides for tests, and container usage only at the
  composition root and entry points.

## Drivers

* **Explicit control** of wiring and instantiation.
* **Compatibility with Hexagonal architecture** and clean test doubles for ports.
* **Low ceremony migration** from my configuration pattern.
* **Maintainability** for a TypeScript codebase.
* **Framework independence**, avoiding lock-in.

## Assumptions

* I use TypeScript in most of the project.
* I run a web server such as Express or a similar solution.
* I do not want decorators or reflection unless there is an overwhelming benefit.

## Constraints

* Avoid hidden behavior such as automatic directory scans or name-based auto-resolution.
* Keep the composition root clear and auditable.
* Make test overrides simple and safe.

## Options

### Awilix

* **Style:** explicit registrations for classes, functions, and values.
* **Injection:** classic mode by constructor parameters or a name-based proxy mode that I will not use.
* **Lifecycles:** singleton, request-scoped, transient.
* **Decorators:** not required.
* **Configuration:** highly configurable and easy to keep explicit.
* **Community and documentation:** mature in the Node.js ecosystem.

### InversifyJS

* **Style:** decorators and reflection metadata.
* **Requires:** reflection metadata and TypeScript configuration changes.
* **Strengths:** powerful, popular, feature-rich.
* **Costs:** more hidden behavior through metadata, steeper setup, and migration from an explicit configuration pattern
  is less direct.

### tsyringe

* **Style:** light decorators and reflection metadata with a global container by default.
* **Strengths:** simple and pleasant with TypeScript.
* **Costs:** fewer container features, less fine-grained scoping, and reliance on decorators.

### TypeDI

* **Style:** decorators with a global container.
* **Strengths:** easy initial adoption.
* **Costs:** more hidden behavior, less explicit control.

### BottleJS

* **Style:** basic, string-based registrations, no decorators.
* **Strengths:** small and straightforward.
* **Costs:** limited scoping and typing, smaller community, not ideal for growth.

### node-dependency-injection (Symfony-style)

* **Style:** configuration files such as YAML or JSON, with optional autowire that can be disabled.
* **Strengths:** extremely explicit and aligned with a configuration-driven mindset.
* **Costs:** verbose, slower day-to-day developer experience, smaller community in Node.js.

### NestJS container

* **Style:** part of a full framework with modules and decorators.
* **Strengths:** robust if I fully embrace the framework.
* **Costs:** framework lock-in and more hidden behavior, not a stand-alone container.

### Continue without a container

* **Strengths:** maximum control, no hidden behavior, identical to the current pattern.
* **Costs:** scales poorly for lifecycles and overrides, repetitive wiring in large codebases.

## Options analysis

**Awilix**

* Positive: no decorators, no reflection, classic injection mode prevents name-based magic, strong support for request
  scope, perfect fit with a composition root and ports and adapters. Migration is almost one-to-one from the
  configuration pattern.
* Negative: if I enable module auto-load or proxy mode, hidden behavior increases. I will not enable those.

**InversifyJS**

* Positive: feature-rich, well known.
* Negative: decorators and reflection metadata introduce hidden behaviour and a more complex setup; migration from
  explicit configuration is more disruptive.

**tsyringe**

* Positive: basic and TypeScript friendly.
* Negative: fewer container features, decorators required, global container by default.

**TypeDI**

* Positive: straightforward start.
* Negative: more implicit behavior and less control due to global container and decorators.

**node-dependency-injection**

* Positive: very explicit and configuration-driven, which I like.
* Negative: verbosity and smaller community reduce long-term ergonomics.

**NestJS container**

* Positive: strong inside NestJS.
* Negative: I do not want framework lock-in or the additional hidden behaviour.

**No container**

* Positive: full control and zero hidden behaviour.
* Negative: lifecycle handling and test overrides become repetitive at scale.

**Conclusion of analysis:** Awilix offers the best balance of explicitness, migration ease, scoping, testability, and
community maturity for a Hexagonal architecture that values control over automatic magic.

## Decision

I adopt **Awilix** with **classic injection mode** and **explicit registrations**. I will not use module auto-loading or
proxy name resolution in production. I will use request-scoped lifecycles for web requests, singleton for stateless
infrastructure, and transient where appropriate. The container will be resolved only in the composition root and in
entry points.

## Consequences

**Positive**

* Fully explicit and auditable wiring that matches my preference for low hidden behavior.
* Natural request scope and straightforward test overrides.
* Basic migration from the existing configuration pattern.
* Framework independence.

**Negative and risks**

* I must keep discipline to avoid resolving from anywhere other than entry points.
* Team members who prefer decorators will need to adapt.
* I must keep a clear convention for registration keys to avoid confusion.

## Implementation plan and removal of the in-memory database

1. **Inventory** the current composition pattern: factories, constructors, ports, adapters, configuration.
2. **Create the container** with Awilix in classic mode and explicit registrations.
3. **Apply request scope** for the web server and process-scope for command line tasks.
4. **Testing:** build a test container helper and override ports with test doubles.
5. **Replace the in-memory database** by registering the real repository in the container.
6. **Remove dead code:** move the in-memory implementation to the test folder or delete it if it is no longer needed.
7. **Guardrails:** code review rules to ensure the container is only used in the composition root and entry points.

