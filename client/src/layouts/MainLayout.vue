<template lang="pug">
q-layout(view='lHh Lpr lFf')
  q-header
    q-toolbar
      q-avatar(square)
        q-img(src='/images/ietf-logo-white.svg', alt='IETF', height='30px', fit='contain')
      q-toolbar-title
        .text-body1 Dev Sandbox Enviroment
      q-btn(
        dense
        flat
        icon='lab la-github'
        href='https://github.com/ietf-tools'
      )
  q-page-container.bg-grey-2
    router-view
</template>

<script setup>

</script>
