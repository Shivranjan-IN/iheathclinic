const queue = [];
let processing = false;

const processQueue = async () => {
    if (processing || queue.length === 0) return;
    processing = true;

    while (queue.length > 0) {
        const { taskFn, taskName, resolve, reject } = queue.shift();
        try {
            console.log(`[TaskQueue] Running background job: ${taskName}`);
            const start = Date.now();
            const result = await taskFn();
            const duration = Date.now() - start;
            console.log(`[TaskQueue] Background job ${taskName} completed in ${duration}ms`);
            resolve(result);
        } catch (error) {
            console.error(`[TaskQueue] Background job ${taskName} failed:`, error);
            reject(error);
        }
    }

    processing = false;
};

/**
 * Enqueue a task to run asynchronously in the background.
 * @param {Function} taskFn - The asynchronous function to run.
 * @param {string} taskName - Name of the task for logging/monitoring.
 * @returns {Promise} Resolves when the task executes.
 */
const enqueue = (taskFn, taskName = 'anonymous-task') => {
    return new Promise((resolve, reject) => {
        queue.push({ taskFn, taskName, resolve, reject });
        // Use setImmediate to defer execution to the next event loop iteration
        setImmediate(processQueue);
    });
};

module.exports = { enqueue };
