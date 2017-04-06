export class Navigation extends React.Component<any, undefined> {

    public render(): JSX.Element {
        return (
            <div className="navigation">
                <h2>Main Menu</h2>
                <nav>
                    <UISrefActive class="active">
                        <UISref to="dashboard"><a>{getText('Dashboard')}</a></UISref>
                    </UISrefActive>
                    <UISrefActive class="active">
                        <UISref to="organisations"><a>{getText('Organisations')}</a></UISref>
                    </UISrefActive>
                    <UISrefActive class="active">
                        <UISref to="unicode"><a>{getText('☃★☺üöäëéíèàâ')}</a></UISref>
                    </UISrefActive>
                </nav>
            </div>
        );
    }
}
