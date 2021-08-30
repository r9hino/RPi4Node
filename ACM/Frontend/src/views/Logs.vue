<template>
    <!-- Checked disabled switch -->
    <div class="container-fluid">
        <div class="row">
            <div class="col-5">
                <h5>Server Logs</h5>
            </div>
            <div class="col-2">
                <div class="dropdown">
                    <button class="btn btn-secondary btn-sm dropdown-toggle" style="width: 80px" type="button" id="dropdownMenuButtonSM" data-bs-toggle="dropdown" aria-expanded="false">
                        {{ typeLog }}
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButtonSM">
                        <li><a class="dropdown-item" @click="selectTypeLog('Errors')" href="#">Errors</a></li>
                        <li><a class="dropdown-item" @click="selectTypeLog('Info')" href="#">Info</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <ul>
            <li class="list-unstyled log" v-for="log in serverLogs">{{ log }}</li>
        </ul>
    </div>
</template>

<script>
import { useStore } from 'vuex';
import { ref, computed, onBeforeMount, onBeforeUnmount } from 'vue';

export default {
    setup(){
        const store = useStore();
        let serverLogs = ref([]);
        let typeLog = ref('Info');

        let getLogs = async (path) => {
            const response = await fetch(`http://rpi4id0.mooo.com:5000/logs/${path.toLowerCase()}`, {
                method: "GET",
                headers: {"Content-Type": "application/text"},
            });
            if(response.status == 200){
                const logText = await response.text();
                serverLogs.value = logText.toString().replace(/\r\n/g,'\n').split('\n');
            }
            else{
                const {message} = await response.text();
                console.log(message);
            }
        };

        let selectTypeLog = (typeLogSelected) => {
            typeLog.value = typeLogSelected;
            getLogs(typeLogSelected);
        };

        onBeforeMount(() => {
            getLogs('Info');
        });

        return {
            serverLogs,
            typeLog,
            getLogs,
            selectTypeLog,
        };
    }
};
</script>
<style>
div.row{
    margin: 10px 0px;
}
li.log{
    font-size: 10px;
    text-align: left;
    margin-left: -20px;
}
</style>