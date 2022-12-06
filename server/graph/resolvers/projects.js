import { DateTime } from 'luxon'
import { last } from 'lodash-es'

/* global APPDATA, DKR */

export default {
  Query: {
    async projects () {
      const containers = await DKR.listContainers()
      console.info(containers)
      return APPDATA.projects.map(pr => {
        const relContainers = containers.filter(c => c.Names.some(n => n.startsWith(`/${pr.prefix}-`) && n.endsWith(`-${pr.suffix}`)))

        return {
          id: pr.id,
          name: pr.name,
          description: pr.description,
          githubUrl: pr.githubUrl,
          githubBuildUrl: pr.githubBuildUrl,
          website: pr.website,
          instances: relContainers.map(c => {
            const normalizedName = c.Names[0].substring(1)
            const nameParts = normalizedName.split('-')
            const appVersion = c.Labels?.appversion
            const commitSha = c.Labels?.commit
            const ghRunId = c.Labels?.ghrunid
            const website = c.Labels?.website

            return {
              id: c.Id,
              name: normalizedName,
              branch: last(nameParts),
              version: appVersion || 'Unknown',
              commitSha: commitSha || 'unknown',
              githubUrl: commitSha ? `${pr.githubUrl}/commit/${commitSha}` : null,
              githubBuildUrl: ghRunId ? `${pr.githubUrl}/actions/runs/${ghRunId}` : null,
              website,
              image: c.Image,
              imageId: c.ImageId,
              createdAt: DateTime.fromSeconds(c.Created).toJSDate()
            }
          })
        }
      })
    }
  }
}
