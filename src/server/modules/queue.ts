import Queue from 'bee-queue';
import redis from 'redis';
import config, {isProduction} from '../config';

interface JobOptions {
	delay?: number;
}

class QueueManager {
	private _config: Queue.QueueSettings;
	private _queueMap: Record<string, Queue>;

	constructor() {
		this._config = {
			redis: redis.createClient(config.redis),
			activateDelayedJobs: true
		};
		this._queueMap = {};
	}

	init(isWorker: boolean) {
		this._config.isWorker = isWorker;
		this._config.getEvents = isWorker;
	}

	getQueue(name: string, options: Queue.QueueSettings = {}): Queue {
		const queue = this._queueMap[name];
		if (!queue) {
			this._queueMap[name] = new Queue(name, {...this._config, ...options});
		}
		return this._queueMap[name];
	}

	createJob(queueName: string, data: any, options: JobOptions = {}): void {
		const queue = this.getQueue(queueName);
		queue.ready().then(() => {
			let job = queue.createJob(data);
			if (options.delay && isProduction) {
				job = job.delayUntil(new Date().getTime() + options.delay);
			}
			job.save();
		});
	}

	proccessJob(queueName: string, jobFn: (job: any, done: Queue.DoneCallback<any>) => void): void {
		const queue = this.getQueue(queueName);
		queue.process(jobFn);
	}
}

export const queueManager = new QueueManager();
