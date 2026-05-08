import {
  Modal,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { X, CreditCard, Trash2, Plus } from 'lucide-react-native';
import { StyledText } from '@/components/ui/styledText';
import Button from '@/components/ui/buttonfg';
import Colors from '@/constants/Colors';
import { useCards, StripeCardItem, useDeleteCard } from '@/hooks/useCards'; // عملنا import للتايب الصح

type Props = {
  visible: boolean;
  onClose: () => void;
  onAddCard: () => void;
};

const PaymentMethodModal = ({ visible, onClose, onAddCard }: Props) => {
  // cards هنا نوعها أوتوماتيك بقى StripeCardItem[] بفضل التظبيطة اللي فوق
  const { data: cards, isLoading } = useCards();
  const { mutate: deleteCard, isPending: isDeleting } = useDeleteCard();

  const handleDelete = (paymentMethodId: string) => {
    Alert.alert(
      "Deleting card",
      "Are you sure you want to delete this card?",
      [
        { text: "cancel", style: "cancel" },
        {
          text: "delete",
          style: "destructive",
          onPress: () => deleteCard(paymentMethodId)
        }
      ]
    );
  };
  return (

    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-center items-center bg-black/60" onPress={onClose}>
        <Pressable
          className="w-11/12 h-[40%] bg-garage-900 border border-garage-700 rounded-3xl overflow-hidden"
          style={{ maxHeight: '85%' }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-garage-800">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 rounded-lg items-center justify-center bg-garage-800">
                <CreditCard size={18} color={Colors.main[900]} />
              </View>
              <StyledText className="text-lg font-titillium-bold text-garage-50">
                Payment Methods
              </StyledText>
            </View>
            <Pressable onPress={onClose} className="p-1" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={Colors.garage[400]} />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView

            className="flex-1"
            contentContainerStyle={{ padding: 20, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {isLoading ? (
              <View className="flex-1 items-center justify-center py-8">
                <ActivityIndicator size="large" color={Colors.main[900]} />
              </View>
            ) : cards && cards.length > 0 ? (
              <View className="gap-4">
                {/* هنا استخدمنا التايب الصح للعنصر الواحد */}
                {cards.map((item: StripeCardItem, index: number) => (
                  <TouchableOpacity
                    key={item.id} // استخدم الـ id الحقيقي بتاع سترايب كـ key بدل الـ index
                    activeOpacity={0.8}
                    className="bg-garage-800 p-4 rounded-2xl border border-garage-700 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center flex-1 pr-4">
                      <View className="w-12 h-10 bg-orange-500 rounded-md items-center justify-center mr-4">
                        <StyledText className="text-black font-bold text-xs uppercase">
                          {/* بندخل جوه item.card عشان نجيب الـ brand */}
                          {item.card.brand}
                        </StyledText>
                      </View>

                      <View className="flex-1 flex-shrink">
                        <StyledText className="text-white font-titillium-bold text-base" numberOfLines={1}>
                          •••• •••• •••• {item.card.last4}
                        </StyledText>
                        <StyledText className="text-garage-400 text-xs mt-1 uppercase">
                          {/* الـ snake_case جاي من سترايب مباشرة */}
                          Exp: {item.card.exp_month}/{item.card.exp_year} • {item.card.funding}
                        </StyledText>
                      </View>
                    </View>

                    <Pressable
                      className="p-2 bg-danger-900/20 rounded-full"
                      hitSlop={8}
                      disabled={isDeleting}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Trash2 size={16} color={Colors.danger[500]} />
                    </Pressable>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="flex-1 items-center justify-center py-10">
                <View className="w-16 h-16 bg-garage-800 rounded-full items-center justify-center mb-4">
                  <CreditCard size={24} color={Colors.garage[500]} />
                </View>
                <StyledText className="text-garage-300 text-center text-base">
                  No payment methods found.
                </StyledText>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="p-5 border-t border-garage-800 bg-garage-900">
            <Button
              title="Add New Card"
              theme="primary"
              onPress={onAddCard}
              Icon={Plus}
              size='md'
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PaymentMethodModal;