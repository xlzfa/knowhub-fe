<template>
  <div class="pagination">
    <el-pagination
      background
      layout="prev, pager, next, jumper"
      :page-size="pageSize"
      :total="total"
      :current-page="current"
      @current-change="onChange"
    />
  </div>
</template>

<script setup lang="js">
const props = defineProps({
  total: { type: Number, default: 0 },
  current: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 }
});

const emit = defineEmits(["change"]);

const onChange = (page) => emit("change", page);
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
</style>

