define([],
    function() {
        "use strict";
        var Cookie = {
            save: function(cookieName, cookieValue, expirationDays) {
                var d = new Date(),
                    expires;
                d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
                expires = "expires=" + d.toUTCString();
                document.cookie = cookieName + "=" + cookieValue + "; " + expires;
            },
            read: function(cookieName) {
                var name,
                    cookies,
                    cookieKeyValue,
                    i;
                name = cookieName + "=";
                cookies = document.cookie.split(';');
                for (i = 0; i < cookies.length; i++) {
                    cookieKeyValue = cookies[i];
                    while (cookieKeyValue.charAt(0) === ' ') {
                        cookieKeyValue = cookieKeyValue.substring(1);
                    }
                    if (cookieKeyValue.indexOf(name) === 0) {
                        return cookieKeyValue.substring(name.length, cookieKeyValue.length);
                    }
                }
                return "";
            }

        };

        return Cookie;
    }
);