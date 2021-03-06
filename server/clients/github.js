var https  = require('https'),
    Q      = require('q'),
    config = require('../config.js');

/**
 * GitHub API client_old.
 * @returns {Object}
 */
var github = function () {
    // GitHub API endpoint.
    var ENDPOINT = 'api.github.com';

    // Request methods.
    var METHOD = {
        DELETE: 'DELETE',
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT'
    };

    /**
     * Calls the GitHub API.
     * @param {string} query
     * @param {string} method
     * @param {Object} data
     * @returns {promise}
     */
    var callApi = function (query, method, data) {
        var deferred = Q.defer(),
            resData = '';

        if (!method) {
            method = METHOD.GET;
        }

        var reqOptions = {
            method: method,
            host: ENDPOINT,
            path: query,
            headers: {
                'User-Agent': 'hello-server',
                'Accept': 'application/json',
                'Content-Length': 0
            }
        };

        if (data) {
            var dataJson = JSON.stringify(data);
            reqOptions.headers['Content-Type'] = 'application/json';
            reqOptions.headers['Content-Length'] = dataJson.length;
            console.log(method + ' https://' + ENDPOINT + query + ' ' + dataJson);
        } else {
            console.log(method + ' https://' + ENDPOINT + query);
        }

        var httpReq = https.request(reqOptions, function (httpRes) {
            // todo: handle invalid requests
            httpRes.setEncoding('utf8');
            httpRes.on('data', function (chunk) {
                resData += chunk;
            });
            httpRes.on('end', function () {
                resData = JSON.parse(resData);
                deferred.resolve(resData);
            });
        });

        httpReq.on('error', function (err) {
            deferred.reject(err);
        });

        if (dataJson) {
            httpReq.write(dataJson);
        }

        httpReq.end();

        return deferred.promise;
    };

    // Exposed methods.
    return {
        /**
         * Lists the information for a specific user.
         * @param {string} user
         * @returns {promise}
         */
        user: function(user) {
            return callApi('/users/' + user);
        },
        /**
         * Lists all repositories for a specific user.
         * @param {string} owner
         * @returns {promise}
         */
        repos: function(owner) {
            return callApi('/users/' + owner + '/repos');
        },
        /**
         * Lists all forks for a specific repository.
         * @param {string} owner
         * @param {string} repo
         * @returns {promise}
         */
        forks: function(owner, repo) {
            return callApi('/repos/' + owner + '/' + repo + '/forks');
        },
        /**
         * Lists all stargazers for a specific repository.
         * @param {string} owner
         * @param {string} repo
         * @returns {promise}
         */
        stargazers: function(owner, repo) {
            return callApi('/repos/' + owner + '/' + repo + '/stargazers');
        }
    };
};

module.exports = github;