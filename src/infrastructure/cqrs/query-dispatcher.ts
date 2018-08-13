
export interface IQuery {
    run(): any;
}

export class QueryDispatcher {
    public dispatch<T>(query: IQuery): T {
        return query.run();
    }
}