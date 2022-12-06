<template lang="pug">
q-page.flex.flex-center
  .projects
    .project(
      v-for='project of state.projects'
      :key='project.id'
      )
      .flex.align-center
        div
          .text-h6 {{project.name}}
          .text-caption.text-grey-7 {{project.description}}
        q-space
        q-btn(
          flat
          icon='lab la-github'
          :href='project.githubUrl'
          )
          q-tooltip View Project on GitHub
        q-btn(
          flat
          icon='las la-rocket'
          :href='project.githubBuildUrl'
          )
          q-tooltip View Builds
        q-btn(
          flat
          icon='las la-external-link-alt'
          color='primary'
          :href='project.website'
          )
          q-tooltip View Production Site
      q-card.q-mt-sm(v-if='project.instances.length > 0')
        q-list(separator)
          q-item(v-for='inst of project.instances')
            q-item-section(side)
              q-spinner-rings(color='positive', size='sm')
            q-item-section
              q-item-label: strong {{ inst.branch }}
              q-item-label(caption) {{ formatDate(inst.createdAt) }}
            q-separator.q-ml-lg(vertical)
            q-item-section(side)
              div
                q-item-label {{ inst.version }}
                q-item-label(caption) {{ inst.commitSha }}
            q-separator.q-ml-lg(vertical)
            q-item-section(side)
              .flex
                q-btn(
                  flat
                  icon='lab la-github'
                  :href='inst.githubUrl'
                  )
                  q-tooltip View Source
                q-btn(
                  flat
                  icon='las la-rocket'
                  :href='inst.githubBuildUrl'
                  )
                  q-tooltip View Build
                q-btn(
                  flat
                  icon='las la-external-link-alt'
                  color='primary'
                  :href='inst.website'
                  )
                  q-tooltip View Site

      .bg-grey-3.q-mt-sm.q-pa-md.rounded-borders(v-else)
        em.text-grey-8 This project has no running instance.
</template>

<script setup>
import gql from 'graphql-tag'
import { useQuasar } from 'quasar'
import { onMounted, reactive } from 'vue'
import { DateTime } from 'luxon'

// QUASAR

const $q = useQuasar()

// DATA

const state = reactive({
  projects: []
})

// METHODS

async function load () {
  try {
    const resp = await APOLLO_CLIENT.query({
      query: gql`
        query getProjects {
          projects {
            id
            name
            description
            githubUrl
            githubBuildUrl
            website
            instances {
              id
              branch
              version
              commitSha
              githubUrl
              githubBuildUrl
              website
              createdAt
            }
          }
        }
      `
    })

    if (resp.data?.projects) {
      state.projects = resp.data.projects
    } else {
      throw new Error('Failed to fetch projects.')
    }
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message
    })
  }
}

function formatDate (rawDate) {
  const dateObj = DateTime.fromISO(rawDate)
  return dateObj.isValid ? dateObj.toFormat('FFF') : ''
}

// MOUNTED

onMounted(() => {
  load()
})

</script>

<style lang="scss">
.projects {
  width: 95%;
  max-width: 1200px;

  .project + .project {
    margin-top: 40px;
  }
}
</style>
