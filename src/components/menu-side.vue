<template>
    <div>
        <el-tree :data="s_statList" :props="defaultProps" accordion @node-click="handleNodeClick"></el-tree>
    </div>
</template>

<script>
  export default {
    name: "menu-side",
    props: ['side'],
    data() {
      return {
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      };
    },
    computed: {
      s_statList () { return this.$store.state.base.statList},
    },
    methods: {
      handleNodeClick (e) {
        if (!e.children) {
          console.log(e.statName)
          this.$store.commit('base/updateStat', {value: e.statName, side: this.side})
        }

      }
    }
  }
</script>

<style scoped>

</style>
