export type ChatLookupTopic = 'transport' | 'sports';
export interface ChatTransportAssignment {
  readonly id: string;
  readonly routeName?: string | null;
  readonly routeNumber?: string | number | null;
  readonly stop?: string | null;
  readonly academicYear?: number | null;
}
export interface ChatSportAssignment {
  readonly id: string;
  readonly sport?: string | null;
  readonly group?: string | null;
  readonly academicYear?: number | null;
}
export type ChatLookupResult =
  | { readonly topic: 'transport'; readonly items: readonly ChatTransportAssignment[] }
  | { readonly topic: 'sports'; readonly items: readonly ChatSportAssignment[] };
