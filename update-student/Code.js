function onSubmit(e) {
    var payload = {};

    e.response.getItemResponses().forEach(function (i) {
        payload[i.getItem().getTitle()] = i.getResponse();
    });

    Logger.log(JSON.stringify(payload));

    var res = UrlFetchApp.fetch(
        'https://xxx.ngrok.io/api/students/' + payload['CUNY ID'],
        {
            method: 'put',
            payload: JSON.stringify(payload),
            contentType: 'application/json',
            muteHttpExceptions: true,
        },
    );

    Logger.log(res.getResponseCode());
    Logger.log(res.getHeaders());
}
