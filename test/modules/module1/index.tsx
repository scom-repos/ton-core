import { Module, customModule, Container } from '@ijstech/components';
import { Address, toNano } from '@scom/ton-core';

@customModule
export default class Module1 extends Module {

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    async init() {
        super.init();
        console.log('Address', Address)
    }

    render() {
        return <i-panel>
            <i-vstack
                margin={{ top: '1rem', left: '1rem', right: '1rem' }}
                gap="1rem"
                alignItems="center"
            >
            </i-vstack>
        </i-panel>
    }
}