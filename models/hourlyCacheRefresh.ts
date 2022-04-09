import { getStats as twitter } from './twitter'
import { getStats as instagram } from './instagram'
import { getStats as facebook } from './facebook'
import { getStats as linkedin } from './linkedin'

export async function refreshCache() {
    await Promise.all([twitter(), facebook(), instagram(), linkedin()])
}