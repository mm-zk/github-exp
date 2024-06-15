<template>

    <div>
            <button @click="buttonClicked()">Show Dialog</button>

            <div v-if="showOverlay" class="overlay">
                <div class="dialog">
                <h2>Hello</h2>
                
                <div>
                    <label v-for="option in checkboxOptions" :key="option.id">
                    <input type="checkbox"  :value="option.id">
                    {{ option.name }}
                    </label>
                </div>
                <input type="text" v-model="inputValue" placeholder="Enter some text">
                <button @click="confirm">Confirm</button>
                <button @click="close">Close</button>
                </div>
            </div>

            
        
        </div>

        
</template>

<script lang="ts" setup>

import { parseEther } from 'viem';
import { type Address, sendTransaction as wagmiSendTransaction, waitForTransaction } from '@wagmi/core';


interface Reviewer {
    login: string,
    id: number;

};

const props = defineProps<
    { repo?: string, prNumber?: number, reviewers?: Reviewer[]}>();

// TODO: here we should query the contract to see if there is any bounty for given repo & pr.

 
    const checkboxOptions = props.reviewers?.map((reviewer, index) => {
        return {id: index, name:reviewer.login}
    });

    const showOverlay = ref(false);
    
    let inputValue = '';

    

    const confirm = () => {
      console.log('Confirmed!');
      sendTransaction();
      // Handle your logic here after confirmation
    };

    const buttonClicked = () => {
                console.log("Before Button pressed", showOverlay);
                showOverlay.value = true;

        console.log("Button pressed", showOverlay);
        
    }

    const close = () => {
        showOverlay.value = false;
        
    }

    const { result: transaction, execute: sendTransaction, inProgress, error} = useAsync(async () => {
        console.log("Sending transaction...");
        const result = await wagmiSendTransaction({
            to: '0xc981b213603171963F81C687B9fC880d33CaeD16',
            value: parseEther('1'),
        });
        console.log(result.hash);
        waitForReceipt(result.hash);
        return result;
    });

    const { result: receipt, execute: waitForReceipt, inProgress: receiptInProgress, error: receiptError} = useAsync(async (transactionHash) => {
        return await waitForTransaction({ hash: transactionHash });
    });

    

</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.dialog {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
}
</style>
