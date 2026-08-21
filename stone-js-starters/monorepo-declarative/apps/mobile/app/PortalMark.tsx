import { JSX } from 'react'
import { Image, useColorScheme } from 'react-native'

/**
 * Le Portail, the Stone.js mark.
 *
 * The same three arcs as `public/logo.svg` in the web starters: two stone segments rising, and the
 * keystone lit in ember. Two files rather than one, because the segments have to contrast with the
 * ground the screen paints, exactly as the brand ships a dark-ground and a light-ground Portal.
 *
 * Shipped as an image on purpose. Drawing it would mean `react-native-svg`, a native module, and
 * a starter's first job is to run on a device the moment it is installed, with nothing to link
 * and no version to match against Expo Go's.
 *
 * @param props.size - Side length in points.
 * @returns The mark.
 */
export function PortalMark ({ size = 104 }: { size?: number }): JSX.Element {
  const scheme = useColorScheme()

  return (
    <Image
      accessibilityRole='image'
      accessibilityLabel='Stone.js'
      source={scheme === 'light'
        ? require('../assets/logo-light.png')
        : require('../assets/logo-dark.png')}
      style={{ width: size, height: size }}
      resizeMode='contain'
    />
  )
}
