import { useEffect, useState } from 'react';

import supabase from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

const useRealtime = (channelName: string, userId: string) => {
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel>();

  useEffect(() => {
    if (!channelName) return;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          // can this be the meeting code?
          key: userId,
        },
      },
    });
    //   .subscribe((status) => {
    //     if (status === 'SUBSCRIBED') {
    //       const sendStatus = async () => {
    //         const trackStatus = await channel.track({
    //           online_at: new Date().toISOString(),
    //           id: userId,
    //           // ...profile,
    //         });
    //         if (trackStatus !== 'ok') {
    //           setTimeout(sendStatus, 100);
    //         } else {
    //         }
    //       };
    //       sendStatus();
    //     }
    //   });

    channel
      .on('presence', { event: 'sync' }, () => presenceChanged())
      .subscribe();

    const presenceChanged = () => {
      const newState = channel.presenceState();
    };

    setRealtimeChannel(channel);

    return () => {
      // channel.untrack().then((status) => console.log(status));
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, userId]);

  return realtimeChannel;
};

export default useRealtime;
