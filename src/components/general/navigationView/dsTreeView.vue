<template>
    <div class="ds-tree-view-container">
        <fv-search-box
            :options="FLAT"
            icon="Search"
            :placeholder="` ` + local('Search Partitions')"
            :theme="theme"
            borderWidth="1"
            background="rgba(255, 255, 255, 0.1)"
            :border-radius="30"
            :revealBorder="true"
            style="width: 95%;"
            @choose-result="treeItemClick"
        ></fv-search-box>
    </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.ds-tree-view-container {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    overflow-x: hidden;
}
</style>