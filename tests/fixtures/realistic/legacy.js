function renderTitle($element) {
    $('<h1>' + getText('My Account', 'title') + '</h1>').appendTo($element);
}

function renderContent($element) {
    var $list = $('<ul>');
    for (var i = 0; i < 5; i++) {
        var $item = $('<li><span>' + getText('Account') + ' ' + i + '</span></li>');
        $item.append('<button>' + getText('Edit') + '</button>');
        $list.append($item);
    }
    $element.append($list);
}

$(function(){
    $('.legacy-account-widget').each(function() {
        renderTitle($(this));
        renderContent($(this));
    });
});
