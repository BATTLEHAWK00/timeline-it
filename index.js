const timelineit = require("./timelineit").default;
const timeline = timelineit()
    .then(
        () => {
            console.log("1");
        },
        1000,
        "d"
    )
    .then(
        () => {
            console.log("2");
        },
        1000,
        "d"
    );
timeline.start();
timeline.start();
