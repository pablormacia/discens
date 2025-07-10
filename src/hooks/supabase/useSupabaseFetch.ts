/* eslint-disable @typescript-eslint/no-explicit-any */
interface Options {
  table: string
  select: string
  eq?: [string, any]
  single?: boolean
  maybeSingle?: boolean
  requireUser?: boolean
}

export function useSupabaseFetch<T = any>(
  options: Options,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchData() {
      setLoading(true)
      setError(null)

      let userId: string | null = null

      if (options.requireUser) {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user?.id) {
          setLoading(false)
          return
        }

        userId = user.id
      }

      let query = supabase.from(options.table).select(options.select)

      if (options.eq) {
        const [key, value] = options.eq
        query = query.eq(key, value ?? userId)
      }

      if (options.single) query = query.single()
      else if (options.maybeSingle) query = query.maybeSingle()

      const { data, error } = await query

      if (error) {
        setError(error)
        setData(null)
      } else {
        setData(data)
      }

      setLoading(false)
    }

    fetchData()
  }, dependencies)

  return { data, loading, error }
}
