export interface SemanticIdType<TId> {
  from(value: string): TId;
}

export interface IdGenerator {
  next<TId>(idType: SemanticIdType<TId>): TId;
}
