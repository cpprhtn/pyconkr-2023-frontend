import { ProgramTypes, TicketType } from '@/@types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader } from '@/components/common/Loader';
import { useRouter } from 'next/router';
import { Routes } from '@/constants/routes';
import * as S from '@/components/ticket/styles';
import Button from '@/components/common/Button';
import { useSetRecoilState } from 'recoil';
import { ticketState } from '@/stores/ticket';
import { TicketAPI } from '@/api';
import SeoHeader from '@/components/layout/SeoHeader';

const TicketPage = () => {
  const router = useRouter();

  const [ticketTypes, setTicketTypes] = useState<
    Record<(typeof ProgramTypes)[number], TicketType[]>
  >({
    CONFERENCE: [],
    CHILDCARE: [],
    TUTORIAL: [],
    SPRINT: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const programTypeContent = useMemo<
    Record<
      (typeof ProgramTypes)[number],
      {
        name: string;
        desc: string;
      }
    >
  >(() => {
    return {
      CONFERENCE: {
        name: '컨퍼런스',
        desc: '8월 12일, 13일 파이콘 한국 2023 컨퍼런스에 참가할 수 있는 티켓입니다.',
      },
      CHILDCARE: {
        name: '아이 돌봄',
        desc: '8월 12일, 13일 아이 돌봄 프로그램을 이용할 수 있는 티켓입니다.\n*참가 인원 미달로 운영되지 않습니다.',
      },
      TUTORIAL: {
        name: '튜토리얼',
        desc: '8월 11일 금요일 튜토리얼에 참가할 수 있는 티켓입니다.',
      },
      SPRINT: {
        name: '스프린트',
        desc: '8월 11일 금요일 스프린트에 참가할 수 있는 티켓입니다.',
      },
    };
  }, []);
  const setTicketState = useSetRecoilState(ticketState);

  const loadTicketTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await TicketAPI.listTicketTypes();
      setTicketTypes(response);
    } catch (e) {
      alert(`티켓 목록 불러오기 실패\n(${e})`);
      router.push(Routes.HOME.route);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadTicketTypes();
  }, [loadTicketTypes, router]);
  useEffect(() => {
    setTicketState((prevState) => ({
      ...prevState,
      ticketTypes: Object.values(ticketTypes).flat(2),
    }));
  }, [ticketTypes, setTicketState]);

  if (isLoading === true)
    return (
      <>
        <Loader />
      </>
    );

  return (
    <>
      <SeoHeader
        title={Routes.TICKET.title}
        description="파이콘 한국 2023: 8월 11~13일 코엑스"
      />
      {ProgramTypes.map((programType) => (
        <S.ProgramTypeSection key={programType}>
          <S.ProgramTypeTitle>
            {programTypeContent[programType].name}
          </S.ProgramTypeTitle>
          <S.ProgramTypeDesc>
            {programTypeContent[programType].desc}
          </S.ProgramTypeDesc>
          {ticketTypes[programType].map((ticketType) => (
            <S.TicketTypeItem key={ticketType.name}>
              <S.TicketTypeItemFrame>
                <div>{ticketType.name}</div>
                <div>
                  {ticketType.price === 0
                    ? '무료'
                    : ticketType.minPrice === null
                    ? `${ticketType.price.toLocaleString()}원`
                    : `${ticketType.minPrice.toLocaleString()}원~`}
                </div>
              </S.TicketTypeItemFrame>
              <S.TicketTypeItemButton>
                {ticketType.buyableUrl !== null ? (
                  <Button
                    size="small"
                    reversal
                    onClick={() => {
                      window.open(ticketType.buyableUrl!);
                    }}
                  >
                    구매하기
                  </Button>
                ) : (
                  <Button size="small" reversal disabled>
                    판매 종료
                  </Button>
                )}
              </S.TicketTypeItemButton>
            </S.TicketTypeItem>
          ))}
        </S.ProgramTypeSection>
      ))}
    </>
  );
};

export default TicketPage;
