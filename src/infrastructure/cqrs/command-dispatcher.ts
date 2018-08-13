
export interface ICommand {
    run(): void;
}

export class CommandDispatcher {

    public dispatch(command: ICommand) {
        command.run();
    }
}