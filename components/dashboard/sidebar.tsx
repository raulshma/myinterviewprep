import { getIterationStatus } from "@/lib/actions/user"
import { isAdmin } from "@/lib/auth/get-user"
import { SidebarClient } from "./sidebar-client"

async function getSidebarData() {
  const [userIsAdmin, iterationResult] = await Promise.all([
    isAdmin(),
    getIterationStatus()
  ])
  
  const iterationData = iterationResult.success 
    ? iterationResult.data 
    : { count: 0, limit: 20, remaining: 20, resetDate: new Date(), plan: 'FREE', isByok: false, interviews: { count: 0, limit: 3, resetDate: new Date() } }

  return {
    isAdmin: userIsAdmin,
    usage: {
      iterations: { count: iterationData.count, limit: iterationData.limit },
      interviews: { count: iterationData.interviews.count, limit: iterationData.interviews.limit },
      plan: iterationData.plan,
      isByok: iterationData.isByok,
    }
  }
}

export async function Sidebar() {
  const initialData = await getSidebarData()
  
  return <SidebarClient initialData={initialData} />
}
