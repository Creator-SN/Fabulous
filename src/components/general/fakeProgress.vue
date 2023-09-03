<template>
    <div v-show="false"></div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
    props: {
        progressCount: {
            default: 0
        }
    },
    data() {
        return {};
    },
    watch: {
        progressCount(val) {
            this.setProgress(val === 0);
        }
    },
    methods: {
        ...mapMutations({
            reviseProgress: 'reviseProgress'
        }),
        setProgress(boom = false) {
            if (boom) {
                this.reviseProgress(100);
                setTimeout(() => {
                    this.reviseProgress(0);
                }, 600);
            } else {
                let val = 0;
                for (let i = 0; i < this.progressCount; i++) {
                    val += 30 / (i + 1);
                }
                this.reviseProgress(val);
            }
        }
    }
};
</script>

<style>
</style>