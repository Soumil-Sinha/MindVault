import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, ScrollView, Switch,
} from 'react-native';
import { ArrowLeft, AtSign, Eye, EyeOff, Smartphone, Globe } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [stayLogged, setStayLogged] = useState(true);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email) return;
    await signIn(email);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.memberBtn}>
            <Text style={styles.memberText}>MEMBER PORTAL</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome tag */}
        <View style={styles.welcomeTag}>
          <Text style={styles.welcomeTagText}>WELCOME BACK</Text>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>HELLO{'\n'}AGAIN<Text style={styles.dot}>.</Text></Text>
        <Text style={styles.subheading}>Log in to your dimension.</Text>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>USERNAME / EMAIL</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="nexus@grid.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AtSign size={18} color={colors.textMuted} style={styles.inputIcon} />
          </View>

          <View style={styles.labelRow}>
            <Text style={styles.label}>PASSWORD</Text>
            <TouchableOpacity><Text style={styles.forgot}>FORGOT?</Text></TouchableOpacity>
          </View>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              {showPass ? (
                <Eye size={18} color={colors.textMuted} style={styles.inputIcon} />
              ) : (
                <EyeOff size={18} color={colors.textMuted} style={styles.inputIcon} />
              )}
            </TouchableOpacity>
          </View>

          {/* Stay logged */}
          <View style={styles.stayRow}>
            <Switch
              value={stayLogged}
              onValueChange={setStayLogged}
              trackColor={{ false: colors.surface, true: colors.purple }}
              thumbColor={colors.textPrimary}
            />
            <Text style={styles.stayText}>STAY LOGGED IN</Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.loginBtnText}>ENTER THE GRID</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR SYNC WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Globe size={18} color={colors.textPrimary} />
            <Text style={styles.socialText}>GOOGLE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Smartphone size={18} color={colors.textPrimary} />
            <Text style={styles.socialText}>APPLE</Text>
          </TouchableOpacity>
        </View>

        {/* Join link */}
        <Text style={styles.joinText}>
          New architect?{' '}
          <Text style={styles.joinLink}>JOIN NOW</Text>
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, width: '100%', maxWidth: 500, alignSelf: 'center' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  backBtn: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center',
  },
  memberBtn: {
    backgroundColor: colors.yellow, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
  },
  memberText: { color: '#000', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  welcomeTag: {
    marginTop: 28, alignSelf: 'flex-start',
    backgroundColor: colors.pink, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4,
  },
  welcomeTagText: { color: '#000', fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  heading: { fontSize: 52, fontWeight: '900', color: colors.textPrimary, lineHeight: 58, marginTop: 10, letterSpacing: -1 },
  dot: { color: colors.pink },
  subheading: { color: colors.yellow, fontSize: 15, fontWeight: '500', marginTop: 6, marginBottom: 28, letterSpacing: 0.3 },

  form: { gap: 10 },
  label: { color: colors.red, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgot: { color: colors.textAccentBlue, fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, height: 50, marginBottom: 6,
  },
  input: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  inputIcon: { marginLeft: 8 },

  stayRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  stayText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1 },

  loginBtn: {
    marginTop: 28, backgroundColor: colors.blue,
    borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center',
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 22, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 10, letterSpacing: 1 },

  socialRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.bgCard, borderRadius: 10, borderWidth: 1, borderColor: colors.border,
    height: 48,
  },
  socialText: { color: colors.textPrimary, fontSize: 13, fontWeight: '700', letterSpacing: 1 },

  joinText: { textAlign: 'center', color: colors.textSecondary, fontSize: 13, marginTop: 24 },
  joinLink: { color: colors.yellow, fontWeight: '800' },
});
