$(document).ready(function () {
    const form = $('#task-form');
    const input = $('#task-input');
    const list_el = $('#tasks');
    let tasks = {};

    // Load tasks from chrome storage
    chrome.storage.sync.get('tasks', function (result) {
        if (result.tasks) {
            tasks = result.tasks;
            // Render existing tasks
            tasks.forEach((task) => {
                const task_el = createTaskElement(task);
                list_el.append(task_el);
            });
        }
    });

    form.on('submit', (e) => {
        e.preventDefault();
        const task_name = input.val();
        if (!task_name) {
            alert("Please add a task");
            return;
        }

        // Create task object
        const task = {
            name: task_name,
            actions: [],
            avgd: 0,
            clickCount: [],
            seconds: []
        };

        // Create Element
        const task_el = createTaskElement(task);
        list_el.append(task_el);

        // Add task to array and store in chrome storage
        tasks.push(task);
        chrome.storage.sync.set({ tasks: tasks });

        // Clear input
        input.val('');
    });

    function createTaskElement(task) {

        // Create task element
        const task_el = $('<div>').addClass('task');

        // Name
        const name_el = $('<div>').addClass('name').text(task.name);
        task_el.append(name_el);

        const avg_el = $('<div>').addClass('avg');
        avg_el.text('Average duration');
        name_el.append(avg_el);
        const count_el = $('<div>').addClass('count');
        count_el.text('Number of clicks');
        name_el.append(count_el);

        //counter
        const counter_el = $('<div>').addClass('counter');
        task_el.append(counter_el);

        const time_el = $('<div>').addClass('time');
        time_el.text('00:00:00');
        counter_el.append(time_el);

        const avgd_el = $('<div>').addClass('avgd');
        avgd_el.text('00:00:00');
        counter_el.append(avgd_el);

        const click_el = $('<div>').addClass('click');
        click_el.text('0');
        counter_el.append(click_el);

        const controls_el = $('<div>').addClass('controls');
        counter_el.append(controls_el);

        //add buttons elements to controls
        const start_btn = $('<button>').addClass('start');
        start_btn.text('Start');

        const stop_btn = $('<button>').addClass('stop');
        stop_btn.text('Stop');

        const reset_btn = $('<button>').addClass('reset');
        reset_btn.text('Reset');

        controls_el.append(start_btn);
        controls_el.append(stop_btn);
        controls_el.append(reset_btn);

        // Actions
        const actions_el = $('<div>').addClass('actions');
        task_el.append(actions_el);

        //counter
        let seconds = 0;
        let interval = null;
        let clickCount = 0;

        start_btn.on('click', start);
        stop_btn.on('click', stop);
        reset_btn.on('click', reset);

        // // Load task from chrome storage
        // chrome.storage.sync.get('task', function (result) {
        //     if (result.task) {
        //         task = result.task;
        //         // Set click count
        //         if (task.clickCount && task.clickCount > 0) {
        //             clickCount = task.clickCount[task.clickCount.length - 1];
        //             click_el.text(clickCount);
        //             task.clickCount.push(clickCount);
        //         }
        //         // Set seconds
        //         if (task.seconds && task.seconds.length > 0) {
        //             seconds = task.seconds[task.seconds.length - 1];
        //             timer();
        //             seconds++;
        //             task.seconds.push(seconds);
        //             avgd_el.text(getAverageDuration());
        //             interval = setInterval(timer, 1000);
        //         }
        //         // Set average duration
        //         if (task.avgd) {
        //             avgd_el.text(task.avgd);
        //         }
        //     }
        // });

        //counter functions
        function timer() {
            seconds++;

            let hrs = Math.floor(seconds / 3600);
            let mins = Math.floor((seconds - (hrs * 3600)) / 60);
            let secs = seconds % 60;

            if (secs < 10) secs = '0' + secs;
            if (mins < 10) mins = '0' + mins;
            if (hrs < 10) hrs = '0' + hrs;

            time_el.text(`${hrs}:${mins}:${secs}`);
        }

        function start() {
            if (interval) {
                clearInterval(interval);
                interval = null;
                if (seconds > 0) {
                    task.seconds.push(seconds);
                    avgd_el.text(getAverageDuration());
                }
                seconds = 0;
                time_el.text('00:00:00');
                return;
            }
            clickCount++;
            click_el.text(clickCount);
            task.clickCount.push(clickCount);
            interval = setInterval(() => {
                timer();
            }, 1000);
            chrome.storage.sync.set({ task: task }, function () {
                console.log(task);
            })
        }

        function stop() {
            clearInterval(interval);
            interval = null;
            clickCount--;
            task.clickCount.pop(clickCount);
            chrome.storage.sync.set({ task: task });
        }

        function reset() {
            stop();
            seconds = 0;
            time_el.text('00:00:00');
            clickCount = 0;
            click_el.text('0');
            avgd_el.text('00:00:00')
            task.seconds = [];
            task.clickCount = [];
            chrome.storage.sync.set({ task: task });
        }

        function getAverageDuration() {
            if (task.clickCount <= 0) return '00:00:00';
            const sumSeconds = task.seconds.reduce((acc, val) => acc + val, 0);
            const averageSeconds = Math.floor(sumSeconds / (task.clickCount.length));
            let hrs = Math.floor(averageSeconds / 3600);
            let mins = Math.floor((averageSeconds - (hrs * 3600)) / 60);
            let secs = averageSeconds % 60;
            if (secs < 10) secs = '0' + secs;
            if (mins < 10) mins = '0' + mins;
            if (hrs < 10) hrs = '0' + hrs;
            return `${hrs}:${mins}:${secs}`;

        }

        // Delete button
        const delete_btn = $('<button>').addClass('delete').text('Delete Queue');
        actions_el.append(delete_btn);
        delete_btn.on('click', () => {
            task_el.remove();
            task.seconds = [];
            task.clickCount = [];
            task.name='';
            // Remove task from array and store in chrome storage
            tasks = tasks.filter(t => t !== task);
            chrome.storage.sync.set({ tasks: tasks });
        });

        return task_el;
    }

});

