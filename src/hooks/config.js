import useSWR from 'swr'
import useConfigStore from '@/store/configStore'
import axios from '@/lib/axios'


export const useConfig = () => {
    const { data, error } = useSWR('/api/config', () =>
        axios
            .get('/api/config')
            .then(res => res.data)
            .catch(() => {
                // if (error.response.status !== 409) throw error
                // router.push('/')
            }),
    )

    const setConfig = useConfigStore((state) => state.setConfig)

    if (data) {
        setConfig(data)
    }

    return {
        config: data,
        isLoading: !error && !data,
        isError: error,
    }
}
