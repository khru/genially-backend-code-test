import { Clock } from "@domain/Clock";

export type MockedClock = jest.Mocked<Clock>;

export const createFixedClock = (date: Date): MockedClock => ({
  now: jest.fn(() => date),
});

export const createDynamicClock = (): MockedClock => ({
  now: jest.fn(() => new Date()),
});
