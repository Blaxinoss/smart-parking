import Colors from "@/constants/Colors"
import { useLocationHook } from "@/hooks/Locations"
import { Navigation } from "lucide-react-native"
import { View } from "react-native"
import { Marker } from "react-native-maps"

export const UserMarker = () => {
    const { coordsFull, rotation } = useLocationHook();

    if (!coordsFull) return null;

    return (
        <Marker
            coordinate={{
                latitude: coordsFull.latitude,
                longitude: coordsFull.longitude
            }}
            title="You here"
            rotation={rotation}
            pinColor={Colors.danger[900]}
        >
            <View className="bg-white p-1.5 rounded-full shadow-lg border border-gray-200">
                <Navigation
                    size={24}
                    color={Colors.main[900]}
                    fill={Colors.main[900]}
                />
            </View>
        </Marker>
    )




}
/* {coordsFull && (
  Platform.OS === "ios" ? (
    <MarkerAnimated
      coordinate={{
        latitude: coordsFull.latitude,
        longitude: coordsFull.longitude
      }}
      title="You here"
      // تريكة إضافية: بتمنع الماركر إنه يعلق لو الخريطة تقلت
      tracksViewChanges={true}

    >
      <View
        style={{
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ rotate: `${rotation}deg` }]
        }}
        // شيلنا الـ p-1.5 عشان حطينا width و height
        className="bg-white rounded-full shadow-lg border border-gray-200"
      >
        <Navigation
          size={24}
          color={Colors.main[900]}
          fill={Colors.main[900]}
        />
      </View>
    </MarkerAnimated>
  ) : (
    <Marker
      coordinate={{
        latitude: coordsFull.latitude,
        longitude: coordsFull.longitude
      }}
      rotation={rotation} // جوجل مابس أندرويد بيفهم دي
      flat={true} // عشان السهم ينام على الشارع
      anchor={{ x: 0.5, y: 0.5 }}
      title="You here"
      tracksViewChanges={false}

    >
      <View className="bg-white p-1.5 rounded-full shadow-lg border border-gray-200">
        <Navigation
          size={24}
          color={Colors.main[900]}
          fill={Colors.main[900]}
        />
      </View>
    </Marker>
  )
)} */
