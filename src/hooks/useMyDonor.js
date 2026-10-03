import { useStore } from './useStore';
import { useAuth } from '../context/AuthContext';
import { getDonors, getDonationHistory } from '../utils/localStorage';

/** The signed-in user's donor record (if registered) and their donation history. */
export function useMyDonor() {
  const { user } = useAuth();
  const donors = useStore(getDonors);
  const history = useStore(getDonationHistory);
  const donor = donors.find((d) => d.userId === user.id);
  const donations = donor ? history.filter((h) => h.donorId === donor.id) : [];
  return { donor, donations };
}
