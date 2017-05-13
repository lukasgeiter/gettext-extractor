export class HelloWorld extends React.Component {
    render() {
        return (
            <div>
                <h1>{ t('Hello World!', 'title') }</h1>
            </div>
        );
    }
}
