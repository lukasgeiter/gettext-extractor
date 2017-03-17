export class SessionExpiresSoonModal extends React.Component<any, undefined> {

    private sessionService: SessionService;

    public logout(): void {
        this.sessionService.logout();
    }

    public stay(): void {
        this.sessionService.keepAlive();
    }

    public render(): JSX.Element {
        return (
            <Modal>
                <p>{getPlural(this.state.remainingSeconds, 'Your session expires in {{n}} second', 'Your session expires in {{n}} seconds')}</p>
                <div className="buttons">
                    <button onclick={this.logout}>{getText('Logout')}</button>
                    <button onclick={this.stay}>{getText('Stay logged in')}</button>
                </div>
            </Modal>
        );
    }
}
