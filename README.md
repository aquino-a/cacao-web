# Cacao
## _Messaging App_


Cacao is a messaging app inspired by the Korean chat app, Kakao.
 This is the front end of the application. 
 It was created using [Angular 10](),
 [StompJS](https://github.com/stomp-js/stompjs), and
 [Bootstrap](https://getbootstrap.com/docs/4.6/getting-started/introduction/). 
 You can find the back end [here][back end].

## Features

- Virtual scrolling to improve performance with many chat messages
- Incremental message loading to improve performance.
- Receive messages in real time
- Google Oauth authorization
- Add friends
- See unread messages count
- Send messages even when the friend is offline
- Receive messages sent to you after logoff


## Installation

The front end requires [npm](https://www.npmjs.com/get-npm).


#### Build

You must create the `environment.ts` file using the sample (`sample.environment.ts`). You need to include the google client id, base url for the backend, and oauth redirect.

Place the directory in the parent directory of the [back end] folder.
Install the necessary dependencies for building like so:

```sh
npm i
```
You can build yourself after installing if you want to deploy it separately using:
```sh
ng build
```

#### Run

The [back end] will statically serve the angular app after automatically building and including it in the jar.



[back end]: https://github.com/aquino-a/cacao
