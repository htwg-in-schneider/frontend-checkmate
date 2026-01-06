<script setup>
const props = defineProps({
  image: String,
  title: String,
  paragraphs: Array, // mehrere Textabschnitte
});
</script>

<template>
  <div class="story-card">
    <img :src="props.image" class="story-img" />

    <div class="story-text">
      <h4>{{ title }}</h4>

      <p v-for="(paragraph, i) in paragraphs" :key="i" v-html="paragraph"></p>
      
    </div>
  </div>
</template>

<style scoped>
.story-card {

  display: flex;
  gap: 1.5rem;
  padding: 10%;
  background-color: #F3EFDF;
  border-radius: 30px;
  overflow: hidden;
  padding: 1.2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-left: 1%;
  margin-right: 1%;
}

.story-img {
  border-radius: 12px;
  object-fit: cover;
  vertical-align: middle;
  overflow-clip-margin: content-box;
  overflow: clip;
}

.story-text {
  flex: 1;
      display: block;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    unicode-bidi: isolate;
        box-sizing: border-box;
}

@media (min-width: 601px) and (max-width: 992px) {

  /* Erfolgsgeschichten bleiben zweispaltig (Flex),
     aber mit angenehmen Abständen */
  .story-card {
    display: flex;         /* Desktop-Layout beibehalten */
    gap: 20px;
    align-items: center;
    text-align: left;
  }
  .story-text { font-size: 17px; }
  .story-img { width: 180px; height: 180px; }
}

</style>
