export interface PatternStrategy<P, R> {
  id: string;
  run(params: P, accessToken: string): Promise<R>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const strategyRegistry = new Map<string, PatternStrategy<any, any>>();
