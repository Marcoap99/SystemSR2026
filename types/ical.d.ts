/**
 * ical.js no publica tipos propios ni hay @types/ical.js -- superficie
 * mínima para lo que usa lib/data/semana.ts (bloque 5 realineación).
 */
declare module "ical.js" {
  export class Time {
    toJSDate(): Date;
  }

  export class Component {
    constructor(jCal: unknown);
    getAllSubcomponents(name: string): Component[];
  }

  export interface OccurrenceDetails {
    startDate: Time;
    endDate: Time;
  }

  export class Event {
    constructor(component: Component);
    summary: string;
    startDate: Time;
    endDate: Time;
    isRecurring(): boolean;
    iterator(startTime?: Time): { next(): Time | null };
    getOccurrenceDetails(occurrence: Time): OccurrenceDetails;
  }

  export function parse(input: string): unknown;

  const ICAL: { parse: typeof parse; Component: typeof Component; Event: typeof Event; Time: typeof Time };
  export default ICAL;
}
