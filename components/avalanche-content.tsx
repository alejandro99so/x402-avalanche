import Image from 'next/image'

interface AvalancheCuriosity {
  title: string
  message: string
  image: string
  fact: string
}

export const AvalancheContent = ({ curiosity }: { curiosity: AvalancheCuriosity }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🔺</span>
          <h3 className="text-2xl font-bold text-gray-900">{curiosity.title}</h3>
        </div>

        <div className="mb-4">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold">
            {curiosity.fact}
          </div>
        </div>

        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          {curiosity.message}
        </p>

        <div className="flex justify-center">
          <div className="relative w-full max-w-md rounded-lg overflow-hidden shadow-xl">
            <Image
              src={curiosity.image}
              alt={curiosity.title}
              width={500}
              height={500}
              className="w-full h-auto"
              unoptimized
            />
          </div>
        </div>
      </div>

      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Want to learn more about Avalanche? Visit{' '}
          <a
            href="https://build.avax.network/academy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:underline font-semibold"
          >
            build.avax.network/academy
          </a>
        </p>
      </div>
    </div>
  )
}
