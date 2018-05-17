import {Tensor} from "@tensorflow/tfjs-core";
import {sampleSize, random} from "lodash";

export interface MemoryConfig {
    memorySize: number;
}

export interface Memento {
    state: Tensor;
    action: number;
    reward: number;
    nextState: Tensor;
}

export class Memory {
    config: MemoryConfig;

    memory: Array<Memento>;
    currentSize: number;

    constructor(config: MemoryConfig) {
        this.config = config;

        this.memory = new Array<Memento>(this.config.memorySize);
        this.currentSize = 0;
    }

    remember(memento: Memento, replaceIfFull: boolean = true) {
        if (this.currentSize < this.config.memorySize)
            this.memory[this.currentSize++] = memento;
        else if (replaceIfFull) {
            let randPos = random(0, this.memory.length-1);
            Memory.freeMemento(this.memory[randPos]);
            this.memory[randPos] = memento;
        }
    }

    sample(batchSize: number) {
        return sampleSize(this.memory.slice(0, this.currentSize), batchSize);
    }

    get CurrentSize() {
        return this.currentSize;
    }

    get Size() {
        return this.memory.length;
    }

    private static freeMemento(memento: Memento) {
        memento.nextState.dispose();
        memento.state.dispose();
    }

    reset(): void {
        this.memory.forEach(memento => Memory.freeMemento(memento));
        this.memory = new Array<Memento>(this.config.memorySize);
        this.currentSize = 0;
    }
}