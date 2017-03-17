export class ApiService {

    private baseUrl: string;

    constructor(
        private toastService: ToastService,
        private translationService: TranslationService,
        private config: IConfig
    ) {
        this.baseUrl = config.apiBaseUrl;
    }

    public post(url: string, options: any): Promise {
        return $.ajax(this.baseUrl + url, options)
            .catch(() => {
                this.toastService.error(this.translationService.getText('Whoops something went wrong'));
            });
    }

}
