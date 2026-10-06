import { Event } from './events';
export default class EventEmitter {
    private listeners;
    on<T extends keyof Event>(type: T, handler: ((payload: Event[T]) => void)): void;
    off<T extends keyof Event>(type: T, handler: ((payload: Event[T]) => void)): void;
    emit<T extends keyof Event>(type: T, payload: Event[T]): void;
}
//# sourceMappingURL=eventemitter.d.ts.map